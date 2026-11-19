import React from "react";
import type { Route, RoutePart } from "./submission";
import "./app.css";

const MODE_LABELS: Record<string, string> = {
    WALK: "Walk",
    BUS: "Bus",
    RAIL: "Rail",
    BICYCLE: "Bike",
    CAR: "Drive",
};

// Great-circle distance in meters between two points
export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
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
    CAR: 11,
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

// ---------- Turn-by-turn steps ----------

export type Step = {
    mode: string;
    text: string;
    meters: number;
    seconds: number;
    lat: number;
    lon: number;
    legIndex: number; // which leg this step belongs to (used to filter the map line)
};

const DIRECTION_TEXT: Record<string, string> = {
    DEPART: "Head onto",
    LEFT: "Turn left onto",
    SLIGHTLY_LEFT: "Bear left onto",
    HARD_LEFT: "Sharp left onto",
    RIGHT: "Turn right onto",
    SLIGHTLY_RIGHT: "Bear right onto",
    HARD_RIGHT: "Sharp right onto",
    CONTINUE: "Continue on",
    CIRCLE_CLOCKWISE: "Take the roundabout onto",
    CIRCLE_COUNTERCLOCKWISE: "Take the roundabout onto",
    ELEVATOR: "Take the elevator",
    UTURN_LEFT: "Make a U-turn onto",
    UTURN_RIGHT: "Make a U-turn onto",
};

function stepText(relativeDirection: string, streetName?: string): string {
    const verb = DIRECTION_TEXT[relativeDirection] ?? "Continue on";
    // OTP uses generic names like "sidewalk" or "path" for unnamed ways
    return streetName ? `${verb} ${streetName}` : verb.replace(/ (onto|on)$/, "");
}

// Walk/bike/car legs become one step per turn.
// Legs without steps (transit, or a backend that doesn't send steps) stay as a single step.
export function buildSteps(legs: RoutePart[]): Step[] {
    return legs.flatMap((leg, legIndex) => {
        const speed = SPEEDS[leg.mode] ?? 5.4;

        if (!leg.steps?.length) {
            const first = leg.geometry[0];
            if (!first) return [];
            const meters = leg.distance ?? legDistance(leg);

            const text = leg.route
                ? `Take ${leg.route.shortName} ${leg.route.longName}: ${leg.from?.name} → ${leg.to?.name}`
                : MODE_LABELS[leg.mode] ?? leg.mode;

            return [
                {
                    mode: leg.mode,
                    text,
                    meters,
                    seconds: leg.duration ?? meters / speed,
                    lat: first.lat,
                    lon: first.lon,
                    legIndex,
                },
            ];
        }

        return leg.steps.map((s) => ({
            mode: leg.mode,
            text: stepText(s.relativeDirection, s.streetName),
            meters: s.distance,
            seconds: s.distance / speed,
            lat: s.lat,
            lon: s.lon,
            legIndex,
        }));
    });
}

// ---------- Component ----------

type Props = {
    route: Route[];
    steps: Step[];
    activeStep: number | null;
    onStart: () => void;
    onReset: () => void;
    onPrev: () => void;
    onNext: () => void;
};

export default function Itinerary({
    route,
    steps,
    activeStep,
    onStart,
    onReset,
    onPrev,
    onNext,
}: Props) {
    const legs = route[0]?.legs ?? [];
    if (legs.length === 0) return null;

    const started = activeStep !== null;
    const totalMeters = legs.reduce((sum, l) => sum + legDistance(l), 0);
    const totalSeconds = legs.reduce((sum, l) => sum + legSeconds(l), 0);

    // Before starting: the full list of steps.
    // After starting: only the current step. Each step keeps its original index
    // so keys and the active highlight stay correct.
    const indexed = steps.map((step, index) => ({ step, index }));
    const visibleSteps = started ? indexed.filter(({ index }) => index === activeStep) : indexed;

    return (
        <aside className="itinerary">
            <div className="itinerary-total">
                <strong>~{formatDuration(totalSeconds)}</strong>
                <span>{formatDistance(totalMeters)} · est.</span>
            </div>

            <ol className="itinerary-legs">
                {visibleSteps.map(({ step, index }) => (
                    <li
                        key={index}
                        className={`itinerary-leg ${index === activeStep ? "active" : ""}`}
                    >
                        <span className={`itinerary-swatch ${step.mode}`} />
                        <span className="itinerary-mode">{step.text}</span>
                        <span className="itinerary-meta">
                            {formatDuration(step.seconds)} · {formatDistance(step.meters)}
                        </span>
                    </li>
                ))}
            </ol>

            {started && (
                <div className="itinerary-nav">
                    <button
                        type="button"
                        className="itinerary-button"
                        onClick={onPrev}
                        disabled={activeStep === 0}
                    >
                        ← Prev
                    </button>
                    <button
                        type="button"
                        className="itinerary-button"
                        onClick={onNext}
                        disabled={activeStep === steps.length - 1}
                    >
                        Next →
                    </button>
                </div>
            )}

            <button
                type="button"
                className="itinerary-button"
                onClick={started ? onReset : onStart}
            >
                {started ? "Show Full Route" : "Start Route"}
            </button>
        </aside>
    );
}