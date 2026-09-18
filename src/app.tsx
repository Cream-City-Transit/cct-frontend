/// <reference types="vite/client" />
import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";
import React from "react";
import Navigation from "./control_inputs";
import TrainIcon from "./train_icon";

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
            zoom={15}
          />

          <Navigation />
        </main>

      </div>
    </IntlProvider>
  );
}

export default App;