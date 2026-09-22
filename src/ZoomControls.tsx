import React from "react";
import { MapRef } from "react-map-gl/maplibre";

interface ZoomControlsProps {
  mapRef: React.RefObject<MapRef | null>;
}

function ZoomControls({ mapRef }: ZoomControlsProps) {
  const handleZoomIn = () => {
    const map = mapRef.current?.getMap();

    if (map) {
      map.setZoom(map.getZoom() + 0.5);
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current?.getMap();

    if (map) {
      map.setZoom(map.getZoom() - 0.5);
    }
  };

  return (
    <div className="zoom-controls">
      <button onClick={handleZoomIn} aria-label="Zoom in">
        +
      </button>

      <button onClick={handleZoomOut} aria-label="Zoom out">
        −
      </button>
    </div>
  );
}

export default ZoomControls;