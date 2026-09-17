/// <reference types="vite/client" />
import BaseMap from "@opentripplanner/base-map";
import { IntlProvider } from "react-intl";
import "./app.css";

function App() {
  return (
    <IntlProvider locale="en" messages={{}}>
    <div className="baseMap">
      <BaseMap
        center={[43.075191, -87.881391]}
        zoom={15}
      />
    </div>
    </IntlProvider>
  );
}


export default App;