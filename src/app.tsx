/// <reference types="vite/client" />

import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import { MapRef} from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import ZoomControls from "./ZoomControls";
import { reverseGeocode } from "./geocoder";
import "maplibre-gl/dist/maplibre-gl.css";
import { Route } from "./submission";
import type { FeatureCollection } from "geojson";

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

  // generate the route line
  const generateRoute = useMemo<GeoJSON.FeatureCollection>(() => ({
    type: "FeatureCollection",
    features: (
      //use the route if it exists, otherwise use an empty array
      route[0]?.legs ?? []).map((routePart) => ({
      type: "Feature",
      properties: { mode: routePart.mode },
      geometry: {
        type: "LineString",
        coordinates: routePart.geometry.map((p) => [p.lon, p.lat]),
      },
      })),
    }),
    
    [route]
  );

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
        paint: { "line-width": 6, "line-color": "#ff0000" },
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

  //zoom into the route that was drawn
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
          </BaseMap>

          <Navigation
            originCoords={originCoords}
            destinationCoords={destinationCoords}
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

          <ZoomControls mapRef={mapRef} />

        </main>

      </div>
    </IntlProvider>
  );
}

export default App;