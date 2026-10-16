import React, { useState } from 'react';
import Submitted from './submission';
import Switch from './switch';
import { Place, usePlaceSearch } from './geocoder';

type Coordinates = {
    lat: number;
    lon: number;
};

type ControlInputsProps = {
    originCoords: Coordinates;
    destinationCoords: Coordinates;

    setOriginCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
    setDestinationCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
    origin: string;
    destination: string;
    setOrigin: (value: string) => void;
    setDestination: (value: string) => void;
};

function Suggestions({ results, onSelect }: { results: Place[]; onSelect: (p: Place) => void }) {
    return (
        <ul className="results-container">
            {results.length > 0 ? (
                results.map((place) => (
                    <li key={place.id} className="results" onClick={() => onSelect(place)}>
                        <strong>{place.name}</strong>
                        <br />
                        {place.address}
                    </li>
                ))
            ) : (
                <li>No location found</li>
            )}
        </ul>
    );
}

function Navigation({
    originCoords,
    destinationCoords,
    setOriginCoords,
    setDestinationCoords,
    origin,
    destination,
    setOrigin,
    setDestination,
}: ControlInputsProps) {
    const [minimized, setMinimized] = useState(false);
    const [originView, setOriginView] = useState(false);
    const [destinationView, setDestinationView] = useState(false);

    const originResults = usePlaceSearch(origin, originView);
    const destinationResults = usePlaceSearch(destination, destinationView);

// test cases, no longer needed
    // const test = [
    //     {"id": 1, "address": "2200 E Kenwood Blvd, Milwaukee, WI 53211", "name": "UW-Milwaukee Student Union", "lat": 43.075192, 'lon': -87.881391},
    //     {"id": 2, "address": "3200 N Cramer St, Milwaukee, WI 53211", "name": "Engineering and Mathematical Sciences Bldg","lat": 43.075683, 'lon': -87.886414},
    //     {"id": 3, "address": "2323 N Cambridge Ave, Milwaukee, WI 53211", "name": "UW-Milwaukee Cambridge Commons", "lat": 43.061137, 'lon': -87.892098},
    //     {"id": 4, "address": "700 N Art Museum Dr, Milwaukee, WI 53202", "name": "Milwaukee Art Museum", "lat": 43.040073, 'lon': -87.897058},
    //     {"id": 5, "address": "1400 E Brady St, Milwaukee, WI 53202", "name": "Walgreens", "lat":   43.053203, 'lon': -87.893555},
    //     {"id": 6, "address": "800 W Wells St, Milwaukee, WI 53233", "name": "Milwaukee Public Museum", "lat": 43.040537, 'lon': -87.920858},
    // ];

    // // Filter locations based on what the user types
    // const filterSearch = (selectedSearchBar: string) => {
    //     return test.filter(
    //         (location) =>
    //             location.address
    //                 .toLowerCase()
    //                 .includes(selectedSearchBar.toLowerCase()) ||
    //             location.name
    //                 .toLowerCase()
    //                 .includes(selectedSearchBar.toLowerCase())
    //     );
    // };



    // Handle typing in the search boxes
    const handleSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        if (event.target.id === 'origin') {
            setOrigin(value);
            setOriginView(true);
        } else if (event.target.id === 'destination') {
            setDestination(value);
            setDestinationView(true);
        }
    };

    // Starting point
    const selectOrigin = (place: Place) => {
        setOrigin(place.address || place.name);
        setOriginCoords({ lat: place.lat, lon: place.lon });
        setOriginView(false);
    };

    // Destination
    const selectDestination = (place: Place) => {
        setDestination(place.address || place.name);
        setDestinationCoords({ lat: place.lat, lon: place.lon });
        setDestinationView(false);
    };
   
    return (
        <form className={`navigation ${minimized ? "minimized" : ""}`} onSubmit={(e) => Submitted(e, originCoords, destinationCoords)}>

            <button type="button" className="minimize_button" onClick={() => {setMinimized(!minimized)}}>
                {minimized ? "▲" : "▼"}
            </button>

            {minimized && (
                <>
                    <input type="search" value={origin} id="origin" placeholder="Starting Location" onChange={handleSearch} /><br />
                    {originView && origin && (
                        <Suggestions results={originResults} onSelect={selectOrigin} />
                    )}

                    <input type="search" value={destination} id="destination" placeholder="Destination" onChange={handleSearch} /><br />
                    {destinationView && destination && (
                        <Suggestions results={destinationResults} onSelect={selectDestination} />
                    )}

                    <button type="submit"> Generate Route </button><br />

                    <Switch mode="MCTS"/>
                    <Switch mode="Prowl Line"/>
                    <Switch mode="U-PARK"/>
                    <Switch mode="The Hop"/>
                </>
            )}
        </form>
    );
}

export default Navigation;