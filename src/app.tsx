/// <reference types="vite/client" />

import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import { MapRef, Popup, Marker } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import ZoomControls from "./ZoomControls";
import { reverseGeocode } from "./geocoder";
import "maplibre-gl/dist/maplibre-gl.css";
import StopsOverlay from "@opentripplanner/stops-overlay";
import { Stop } from "@opentripplanner/types";
import { Route, requestRoute } from "./submission";
import type { FeatureCollection } from "geojson";
import { BusStop } from 'iconoir-react';
import Itinerary, {
  legSeconds,
  legDistance,
  formatDuration,
  formatDistance,
  buildSteps,
  haversine,
} from "./planRoute";

type Coordinates = {
  lat: number;
  lon: number;
};

// within this many meters of the next step, auto-advance
const ADVANCE_RADIUS_M = 20;

function App() {
  const mapRef = useRef<MapRef | null>(null);

  // Starting location
  const [originCoords, setOriginCoords] = useState<Coordinates>({
    lat: 43.075191,
    lon: -87.881391,
  });

  // Destination
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates>({
    lat: 43.075191,
    lon: -87.880391,
  });

  // Address text shown in the search inputs
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  // selected modes
  const [modes, setModes] = useState<string[]>([]);
  // stops
  const [stops, setStops] = useState<Stop[]>([]);
  // the route
  const [route, setRoute] = useState<Route[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  // null = show the whole route, a number = index of the active turn-by-turn step
  const [activeStep, setActiveStep] = useState<number | null>(null);
  // true once the user has pressed "Generate Route" (and not cleared it since)
  const [hasGeneratedRoute, setHasGeneratedRoute] = useState(false);

  // used to user tracking
  const watchIdRef = useRef<number | null>(null);
  const [livePosition, setLivePosition] = useState<{
    lat: number;
    lon: number;
    heading: number | null;
    accuracy: number;
  } | null>(null);

  // Flat list of turn-by-turn steps for the current route
  const steps = useMemo(() => buildSteps(route[0]?.legs ?? []), [route]);

  // The map line is still drawn per leg, so derive the active leg from the active step
  const activeLeg = activeStep === null ? null : steps[activeStep]?.legIndex ?? null;

  // The GPS watch callback is created once, so it reads current values through refs
  // instead of closing over stale state
  const stepsRef = useRef(steps);
  const activeStepRef = useRef(activeStep);
  stepsRef.current = steps;
  activeStepRef.current = activeStep;

  // Wipe the current route because it no longer matches the start/end points
  const clearRoute = () => {
    setRoute([]);
    setActiveStep(null);
    setShowPopup(false);
    setHasGeneratedRoute(false);
    stopTracking();
  };

  // Fires when a pin is dragged and dropped (also used by "use my location")
  const handleSetLocation = async ({ location, locationType }: any) => {
    const coords = { lat: location.lat, lon: location.lon };
    const isFrom = locationType === "from";
    const setCoords = isFrom ? setOriginCoords : setDestinationCoords;
    const setText = isFrom ? setOrigin : setDestination;

    clearRoute();

    setCoords(coords);
    // Show raw coordinates immediately, replace with the address when it arrives
    setText(`${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`);

    try {
      const place = await reverseGeocode(coords.lat, coords.lon);
      if (place) setText(place.address || place.name);
    } catch (e) {
      console.error(e);
    }
  };

  // Use the browser's current position as the starting location
  const locateMe = () => {
    if (!("geolocation" in navigator)) {
      alert("Your browser doesn't support location services.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };

        // Treat it like the origin pin being dropped at the user's position
        await handleSetLocation({ location: coords, locationType: "from" });

        mapRef.current?.flyTo({
          center: [coords.lon, coords.lat], // MapLibre wants [lon, lat]
          zoom: 16,
          duration: 1000,
        });
      },
      (err) => {
        // 1 = permission denied, 2 = position unavailable, 3 = timeout
        console.error("Geolocation error:", err.code, err.message);
        if (err.code === 1) {
          alert("Location permission was denied. Enable it in your browser settings to use this.");
        } else {
          alert("Couldn't get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Jump to a step: update state and (optionally) move the camera to it
  const goToStep = (index: number, fly = true) => {
    const list = stepsRef.current;
    if (index < 0 || index >= list.length) return;
    const step = list[index];
    setActiveStep(index);
    if (fly) {
      mapRef.current?.flyTo({
        center: [step.lon, step.lat],
        zoom: 17,
        duration: 800,
      });
    }
  };

  // track the user as they move once they start the route
  const trackUser = () => {
    if (!("geolocation" in navigator)) {
      alert("Your browser doesn't support location services.");
      return;
    }

    //check to see if we are already tracking before we start 
    if (watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        //console log test for location updates
        console.log(
          new Date().toLocaleTimeString(),
          pos.coords.latitude.toFixed(6),
          pos.coords.longitude.toFixed(6),
          "accuracy:", Math.round(pos.coords.accuracy), "m"
        );

        const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };

        //update our live position 
        setLivePosition({
          lat: here.lat,
          lon: here.lon,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
        });

        // auto-advance when the user reaches the start of the next step
        const current = activeStepRef.current;
        const list = stepsRef.current;
        if (current !== null && current + 1 < list.length) {
          const next = list[current + 1];
          if (haversine(here, next) < ADVANCE_RADIUS_M) {
            goToStep(current + 1, false); // don't yank the camera while they're moving
          }
        }
      },
      (err) => {
        console.error("Geolocation error:", err.code, err.message);
        if (err.code === 1) {
          alert("Location permission was denied. Enable it in your browser settings to use this.");
          stopTracking();
        } else {
          alert("Couldn't get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
  };

  // stop tracking once the user ends the route
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLivePosition(null);
  };

  // generate the route line (only the active leg once the route has started)
  const generateRoute = useMemo<GeoJSON.FeatureCollection>(() => {
    const allLegs = route[0]?.legs ?? [];
    const visible = activeLeg === null ? allLegs : allLegs.slice(activeLeg, activeLeg + 1);

    //add lines to connect each leg
    const features: GeoJSON.Feature[] = [];

    //draw each leg
    visible.forEach((routePart, i) => {
      const coords = routePart.geometry.map((p) => [p.lon, p.lat]);

      features.push({
        type: "Feature",
        properties: { mode: routePart.mode },
        geometry: { type: "LineString", coordinates: coords },
      });

      //check if we have another leg after the current one
      const next = visible[i + 1];
      if (next && coords.length && next.geometry.length) {
        const end = coords[coords.length - 1];
        const start = [next.geometry[0].lon, next.geometry[0].lat];

        //if the end and start of each leg aren't touching then add a connecting line
        if (end[0] !== start[0] || end[1] !== start[1]) {
          features.push({
            type: "Feature",
            properties: { mode: next.mode },
            geometry: { type: "LineString", coordinates: [end, start] },
          });
        }
      }
    });

    return { type: "FeatureCollection", features };
  }, [route, activeLeg]);

  //draw the routing line
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const apply = () => {
      const existing = map.getSource("route") as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(generateRoute);
        return;
      }
      map.addSource("route", { type: "geojson", data: generateRoute });

      //add border for the line first, darker than the actual lines
      map.addLayer({
        id: "route-line-border",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-width": 6,
                "line-color": {
                  property: "mode",
                  type: "categorical",
                  stops: [
                    ["WALK", "#880000"],
                    ["CAR", "#884100"],
                    ["BUS", "#887500"],
                    ["BICYCLE", "#000088"],
                  ]
                }, },
      });

      //draw the actual line itself
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-width": 3,
                "line-color": {
                  property: "mode",
                  type: "categorical",
                  stops: [
                    // temporary color scheme, will adjust as data gets changed
                    ["WALK", "#ff0000"],
                    ["CAR", "#ff7900"],
                    ["BUS", "#ffea00"],
                    // ["Prowl Line", "#ffea00"],
                    // ["U-PARK", "#00ff00"],
                    // ["The Hop", "#0000ff"],
                    ["BICYCLE", "#0000ff"],
                  ]
                }, },
      });
    };

    try {
      apply();
    } catch {
      map.once("idle", apply);
    }
  }, [generateRoute]);

  const handleRoute = (routes: Route[]) => {
    stopTracking();
    setRoute(routes);
    setActiveStep(null);
    setShowPopup(true);

    const pts = routes[0]?.legs.flatMap((part) => part.geometry) ?? [];
    if (pts.length) {
        const lons = pts.map((point) => point.lon);
        const lats = pts.map((point) => point.lat);

        mapRef.current?.fitBounds(
            [
                [Math.min(...lons), Math.min(...lats)],
                [Math.max(...lons), Math.max(...lats)],
            ],
            { padding: 200, duration: 800 }
        );
    }
  };

  const handleStops = (stops: Stop[]) => {
    setStops(stops);
  };

  // zoom to the first step and start tracking
  const startRoute = () => {
    if (!steps.length) return;
    setShowPopup(false);
    trackUser();
    goToStep(0);
  };

  // manual navigation between steps
  const prevStep = () => {
    if (activeStep !== null) goToStep(activeStep - 1);
  };
  const nextStep = () => {
    if (activeStep !== null) goToStep(activeStep + 1);
  };

  // Swap starting and ending locations
  const swapLocations = () => {
    stopTracking();
    const newOrigin = destinationCoords;
    const newDestination = originCoords;

    setOriginCoords(newOrigin);
    setDestinationCoords(newDestination);

    setOrigin(destination);
    setDestination(origin);

    setRoute([]);
    setActiveStep(null);
    setShowPopup(false);

    // Only regenerate if the user previously requested a route
    if (hasGeneratedRoute) {
      requestRoute(newOrigin, newDestination, modes, handleRoute);
    }
  };

  const legs = route[0]?.legs ?? [];
  const allPts = legs.flatMap((l) => l.geometry);
  const midPoint = allPts[Math.floor(allPts.length / 2)]; // popup sits halfway along the route
  const totalSeconds = legs.reduce((sum, l) => sum + legSeconds(l), 0);
  const totalMeters = legs.reduce((sum, l) => sum + legDistance(l), 0);

  return (
<IntlProvider
  locale="en"
  messages={{}}
  onError={(err) => {
    if (err.code === "MISSING_TRANSLATION") return;
    console.error(err);
  }}
>      <div className="app">

        <header className="header">
          <div className="header-left">
            <h1>Cream City Transit</h1>
            <TrainIcon />
          </div>
        </header>

        <main className="baseMap">

          <BaseMap
            center={[43.075191, -87.881391]}
            zoom={15}
            innerRef={mapRef}
            baseLayer="https://tiles.openfreemap.org/styles/liberty"
          >
            <EndpointsOverlay
              fromLocation={{
                lat: originCoords.lat,
                lon: originCoords.lon,
                name: origin || "from",
              }}
              toLocation={{
                lat: destinationCoords.lat,
                lon: destinationCoords.lon,
                name: destination || "to",
              }}
              setLocation={handleSetLocation}
            />
            {livePosition && (
              <Marker latitude={livePosition.lat} longitude={livePosition.lon}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#ffbd00",
                    border: "3px solid #000000",
                  }}
                />
              </Marker>
            )}
            {showPopup && midPoint && (
              <Popup
                latitude={midPoint.lat}
                longitude={midPoint.lon}
                anchor="bottom"
                closeOnClick={false}
                onClose={() => setShowPopup(false)}
              >
                <strong>~{formatDuration(totalSeconds)}</strong>
                <br />
                {formatDistance(totalMeters)} · est.
              </Popup>
            )}
            {/* <StopsOverlay stops={stops} visible={true} StopMarker={<BusStop/>} color={'#4A70A9'} highlightedStopColor={'red'}/> */}
          </BaseMap>

          <Navigation
            originCoords={originCoords}
            destinationCoords={destinationCoords}
            onSwap={swapLocations}
            onUseLocation={locateMe}
            clearRoute={clearRoute}
            setHasGeneratedRoute={setHasGeneratedRoute}
            setOriginCoords={setOriginCoords}
            setDestinationCoords={setDestinationCoords}
            origin={origin}
            destination={destination}
            setOrigin={setOrigin}
            setDestination={setDestination}
            modes={modes}
            setModes={setModes}
            getRoute={handleRoute}
            getStops={handleStops}
          />
          <Itinerary
            route={route}
            steps={steps}
            activeStep={activeStep}
            onStart={startRoute}
            onReset={() => handleRoute(route)}
            onPrev={prevStep}
            onNext={nextStep}
          />

          <ZoomControls mapRef={mapRef} />
        </main>
      </div>
    </IntlProvider>
  );
}

export default App;