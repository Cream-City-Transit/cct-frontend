import React from "react";
import type { Route, RoutePart, Point } from "./submission";
import "./app.css";


const MODE_LABELS: Record<string, string> = {
    WALK: "Walk",
    BUS: "Bus",
    RAIL: "Rail",
    BICYCLE: "Bike",
};

// Great-circle distance in meters between two points
function haversine(a: Point, b: Point) {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

export function legDistance(leg: RoutePart): number {
    let total = 0;
    for (let i = 1; i < leg.geometry.length; i++) {
        total += haversine(leg.geometry[i - 1], leg.geometry[i]);
    }
    return total;
}

export function formatDistance(meters: number): string {
    return `${(meters / 1609.344).toFixed(1)} mi`;
}
// Rough average speeds in meters/second (walk ~3 mph, bus ~12 mph, etc.)
const SPEEDS: Record<string, number> = {
    WALK: 1.34,
    BUS: 5.4,
    RAIL: 9,
    BICYCLE: 4.5,
};

export function legSeconds(leg: RoutePart): number {
    return legDistance(leg) / (SPEEDS[leg.mode] ?? 5.4);
}

export function formatDuration(seconds: number): string {
    const mins = Math.max(1, Math.round(seconds / 60));
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
}

type Props = {
    route: Route[];
    started: boolean;
    onStart: () => void;
    onReset: () => void;
  };
  
  export default function Itinerary({ route, started, onStart, onReset }: Props) {
    const legs = route[0]?.legs ?? [];
    if (legs.length === 0) return null;

    const totalMeters = legs.reduce((sum, l) => sum + legDistance(l), 0);
    const totalSeconds = legs.reduce((sum, l) => sum + legSeconds(l), 0);
    
    return (
        <aside className="itinerary">
            <div className="itinerary-total">
                <strong>~{formatDuration(totalSeconds)}</strong>
                <span>{formatDistance(totalMeters)} · est.</span>
            </div>
            <ol className="itinerary-legs">
                {legs.map((leg, i) => (
                    <li key={i} className="itinerary-leg">
                        <span
                            className="itinerary-swatch"
                        />
                        <span className="itinerary-mode">
                            {MODE_LABELS[leg.mode] ?? leg.mode}
                        </span>
                        <span className="itinerary-meta">
                            {formatDuration(legSeconds(leg))} · {formatDistance(legDistance(leg))}
                        </span>
                    </li>
                ))}
            </ol>
            {legs.length > 0 && (
  <button
    type="button"
    className="itinerary-button"
    onClick={started ? onReset : onStart}
  >
    {started ? "Show Full Route" : "Start Route"}
  </button>
)}
        </aside>
    );
}