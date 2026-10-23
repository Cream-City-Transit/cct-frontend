/// <reference types="vite/client" />

import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React, { useRef, useState } from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import { MapRef } from "react-map-gl/maplibre";
import ZoomControls from "./ZoomControls";
import { reverseGeocode } from "./geocoder";
import "maplibre-gl/dist/maplibre-gl.css";
import StopsOverlay from "@opentripplanner/stops-overlay";
import { Stop } from "@opentripplanner/types";

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
              <StopsOverlay
                  stops={testStop}
                  visible={true}
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
          />

          <ZoomControls mapRef={mapRef} />

        </main>

      </div>
    </IntlProvider>
  );
}

export default App;