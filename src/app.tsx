
/// <reference types="vite/client" />

import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React, { useRef } from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import { MapRef } from "react-map-gl/maplibre";
import ZoomControls from "./ZoomControls";
import "maplibre-gl/dist/maplibre-gl.css";



function App() {
  const mapRef = useRef<MapRef | null>(null);

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
            innerRef={mapRef}>
            <EndpointsOverlay
              fromLocation={{lat: 43.075191, lon: -87.881391, name: "from"}}
              toLocation={{lat: 43.075191, lon: -87.880391, name: "to"}}
            /> 
          </BaseMap>

          <Navigation />

          <ZoomControls mapRef={mapRef} />

        </main>

      </div>
    </IntlProvider>
  );
}

export default App;