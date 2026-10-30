/// <reference types="vite/client" />

import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import { MapRef, Popup } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import ZoomControls from "./ZoomControls";
import { reverseGeocode } from "./geocoder";
import "maplibre-gl/dist/maplibre-gl.css";
import StopsOverlay from "@opentripplanner/stops-overlay";
import { Stop } from "@opentripplanner/types";
import { Route, requestRoute } from "./submission";
import type { FeatureCollection } from "geojson";
import Itinerary, {
  legSeconds,
  legDistance,
  formatDuration,
  formatDistance,
} from "./planRoute";

const testStop: Stop[] =  [
    { id: "4026", lat: 42.9766622,  lon: -87.9481609, name: "S27 & S3744", gtfsId: "MCTS:4026"},
    { id: "4027", lat: 42.9816537,  lon: -87.9481095, name: "S27 & MORGAN", gtfsId: "MCTS:4027"},
    { id: "4025", lat: 42.9737435,  lon: -87.9482475, name: "S27 & HOWARD", gtfsId: "MCTS:4025"},
    { id: "4022", lat: 42.9665053,  lon: -87.9483668, name: "S27 & BOLIVAR", gtfsId: "MCTS:4022"},
];

type Coordinates = {
  lat: number;
  lon: number;
};

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

  // the route
  const [route, setRoute] = useState<Route[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  // null = show the whole route, a number = show only that leg
  const [activeLeg, setActiveLeg] = useState<number | null>(null);

  // Fires when a pin is dragged and dropped
  const handleSetLocation = async ({ location, locationType }: any) => {
    const coords = { lat: location.lat, lon: location.lon };
    const isFrom = locationType === "from";
    const setCoords = isFrom ? setOriginCoords : setDestinationCoords;
    const setText = isFrom ? setOrigin : setDestination;

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

  // generate the route line (only the active leg once the route has started)
  const generateRoute = useMemo<GeoJSON.FeatureCollection>(() => {
    const allLegs = route[0]?.legs ?? [];
    const visible = activeLeg === null ? allLegs : allLegs.slice(activeLeg, activeLeg + 1);
    return {
      type: "FeatureCollection",
      features: visible.map((routePart) => ({
        type: "Feature",
        properties: { mode: routePart.mode },
        geometry: {
          type: "LineString",
          coordinates: routePart.geometry.map((p) => [p.lon, p.lat]),
        },
      })),
    };
  }, [route, activeLeg]);

  // draw the routing line
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
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-width": 6,
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
                } },
      });
    };

    try {
      apply();
    } catch {
      map.once("idle", apply);
    }
  }, [generateRoute]);

  const handleRoute = (routes: Route[]) => {
    setRoute(routes);
    setActiveLeg(null);
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

  // zoom to the start of the route and show only the first leg
const startRoute = () => {
  const firstLeg = route[0]?.legs[0];
  const start = firstLeg?.geometry[0];
  if (!start) return;
  setActiveLeg(0);
  setShowPopup(false);
  mapRef.current?.flyTo({
    center: [start.lon, start.lat],
    zoom: 17,
    duration: 1200,
  });
};
// Swap starting and ending locations
const swapLocations = () => {
  const newOrigin = destinationCoords;
  const newDestination = originCoords;

  setOriginCoords(newOrigin);
  setDestinationCoords(newDestination);

  setOrigin(destination);
  setDestination(origin);

  setRoute([]);
  setActiveLeg(null);
  setShowPopup(false);

  // Only regenerate if the user previously requested a route
  if (hasGeneratedRoute) {
      requestRoute(newOrigin, newDestination, modes, handleRoute);
  }
};
const [hasGeneratedRoute, setHasGeneratedRoute] = useState(false);

  const legs = route[0]?.legs ?? [];
  const allPts = legs.flatMap((l) => l.geometry);
  const midPoint = allPts[Math.floor(allPts.length / 2)]; // popup sits halfway along the route
  const totalSeconds = legs.reduce((sum, l) => sum + legSeconds(l), 0);
  const totalMeters = legs.reduce((sum, l) => sum + legDistance(l), 0);

  return (
    <IntlProvider locale="en" messages={{}}>
      <div className="app">

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
            <StopsOverlay stops={testStop} visible={true} />
          </BaseMap>

          <Navigation
            originCoords={originCoords}
            destinationCoords={destinationCoords}
            onSwap={swapLocations}
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
          />
          <Itinerary
            route={route}
            started={activeLeg !== null}
            onStart={startRoute}
            onReset={() => handleRoute(route)}
          />

          <ZoomControls mapRef={mapRef} />
        </main>
      </div>
    </IntlProvider>
  );
}

export default App;