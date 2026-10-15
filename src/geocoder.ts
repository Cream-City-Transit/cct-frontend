import { useEffect, useState } from "react";

export type Place = {
    id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
};

const PHOTON = "https://photon.komoot.io/api/";
// minLon,minLat,maxLon,maxLat: restricts results to the Milwaukee area, adjust as needed
const BBOX = "-88.3,42.8,-87.7,43.3";

function toPlace(feature: any, index: number): Place {
    const p = feature.properties ?? {};
    const [lon, lat] = feature.geometry.coordinates; // GeoJSON is [lon, lat]
    const street = [p.housenumber, p.street].filter(Boolean).join(" ");
    const address = [street, p.city, p.state, p.postcode].filter(Boolean).join(", ");
    return {
        id: `${p.osm_type}${p.osm_id}-${index}`,
        name: p.name ?? (street || address),
        address,
        lat,
        lon,
    };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
    const url = `${PHOTON}?q=${encodeURIComponent(query)}&limit=5&bbox=${BBOX}`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
    const data = await res.json();
    return (data.features ?? []).map(toPlace);
}

// Debounced search; cancels stale requests as the user keeps typing
export function usePlaceSearch(query: string, active: boolean): Place[] {
    const [results, setResults] = useState<Place[]>([]);

    useEffect(() => {
        if (!active || query.trim().length < 3) {
            setResults([]);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            searchPlaces(query, controller.signal)
                .then(setResults)
                .catch((e) => {
                    if (e.name !== "AbortError") console.error(e);
                });
        }, 350);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, active]);

    return results;
}

export async function reverseGeocode(lat: number, lon: number): Promise<Place | null> {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);
    const data = await res.json();
    return data.features?.length ? toPlace(data.features[0], 0) : null;
}