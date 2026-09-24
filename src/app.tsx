/// <reference types="vite/client" />
import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React from "react";
import EndpointsOverlay from "@opentripplanner/endpoints-overlay";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";
import "maplibre-gl/dist/maplibre-gl.css";



function App() {
  return (
    <IntlProvider locale="en" messages={{}}>
      <div className="app">

        <header className="header">
          <div className="header-left">
            <h1>Cream City Transit</h1>
            <TrainIcon />

          </div>

          <nav className="header-nav">
            <a href="#">Home</a>
            <a href="#">Log In</a>
          </nav>
        </header>

        <main className="baseMap">
          <BaseMap
            center={[43.075191, -87.881391]}
            zoom={15}>
            <EndpointsOverlay
              fromLocation={{lat: 43.075191, lon: -87.881391, name: "from"}}
              toLocation={{lat: 43.075191, lon: -87.880391, name: "to"}}
            /> 
          </BaseMap>

          <Navigation />
         
        </main>

      </div>
    </IntlProvider>
  );
}

export default App;