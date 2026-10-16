import React, { useState } from 'react';
import Submitted from './submission';
import Switch from './switch';

type Location = {
    id: number;
    address: string;
    name: string;
    lat: number;
    lon: number;
};

type Coordinates = {
    lat: number;
    lon: number;
};

type ControlInputsProps = {
    originCoords: Coordinates | Location;
    destinationCoords: Coordinates | Location;
    setOriginCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
    setDestinationCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
};



function Navigation({
    originCoords,
    destinationCoords,
    setOriginCoords,
    setDestinationCoords,
}: ControlInputsProps) {

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [walkingDistance, setWalkingDistance] = useState(1);

    const [minimized, setMinimized] = useState(false);
    const [originView, setOriginView] = useState(false);
    const [destinationView, setDestinationView] = useState(false);
    const test = [
        {"id": 1, "address": "2200 E Kenwood Blvd, Milwaukee, WI 53211", "name": "UW-Milwaukee Student Union", "lat": 43.075192, 'lon': -87.881391},
        {"id": 2, "address": "3200 N Cramer St, Milwaukee, WI 53211", "name": "Engineering and Mathematical Sciences Bldg","lat": 43.075683, 'lon': -87.886414},
        {"id": 3, "address": "2323 N Cambridge Ave, Milwaukee, WI 53211", "name": "UW-Milwaukee Cambridge Commons", "lat": 43.061137, 'lon': -87.892098},
        {"id": 4, "address": "700 N Art Museum Dr, Milwaukee, WI 53202", "name": "Milwaukee Art Museum", "lat": 43.040073, 'lon': -87.897058},
        {"id": 5, "address": "1400 E Brady St, Milwaukee, WI 53202", "name": "Walgreens", "lat":   43.053203, 'lon': -87.893555},
        {"id": 6, "address": "800 W Wells St, Milwaukee, WI 53233", "name": "Milwaukee Public Museum", "lat": 43.040537, 'lon': -87.920858},
    ];

    // Filter locations based on what the user types
    const filterSearch = (selectedSearchBar: string) => {
        return test.filter(
            (location) =>
                location.address
                    .toLowerCase()
                    .includes(selectedSearchBar.toLowerCase()) ||
                location.name
                    .toLowerCase()
                    .includes(selectedSearchBar.toLowerCase())
        );
    };

    // Handle typing in the search boxes
    const handleSearch = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        if (event.target.id === 'origin') {
            setOrigin(value);

            if (!originView) {
                setOriginView(true);
            }
        } else if (event.target.id === 'destination') {
            setDestination(value);

            if (!destinationView) {
                setDestinationView(true);
            }
        }
    };
//starting point
    const selectOrigin = (location: Location) => {
        setOrigin(location.address);

        setOriginCoords({
            lat: location.lat,
            lon: location.lon,
        });

        setOriginView(false);
    };
//destination
    const selectDestination = (location: Location) => {
        setDestination(location.address);

        setDestinationCoords({
            lat: location.lat,
            lon: location.lon,
        });

        setDestinationView(false);
    };
    const walkingPreference = (preference:React.ChangeEvent<HTMLInputElement>) => {
        setWalkingDistance(preference.target.value);
    };
    

    return (
        <form className={`navigation ${minimized ? "minimized" : ""}`} onSubmit={(e) => Submitted(e, originCoords, destinationCoords)}>
            <button type="button" className="minimize_button" onClick={() => {setMinimized(!minimized)}}>
                {minimized ? "▲" : "▼"}
            </button>

            {minimized && (
                <>
                    <input type="search" className="search" value={origin} id="origin" placeholder="Starting Location" onChange={handleSearch}/><br/>
                    {originView && origin && (
                        <ul className="results-container">
                            {filterSearch(origin).length > 0 ? (
                                filterSearch(origin).map((location) => (
                                    <li
                                        key={location.id}
                                        className="results"
                                        onClick={() =>
                                            selectOrigin(location)
                                        }
                                    >
                                        <strong>
                                            {location.name}
                                        </strong>
                                        <br />
                                        {location.address}
                                    </li>
                                ))
                            ) : (
                                <li>No location found</li>
                            )}
                        </ul>
                    )}
                    <input type="search" className="search" value={destination} id="destination" placeholder="Destination" onChange={handleSearch}/><br/>
                    {destinationView && destination && (
                        <ul className="results-container">
                            {filterSearch(destination).length > 0 ? (
                                filterSearch(destination).map(
                                    (location) => (
                                        <li
                                            key={location.id}
                                            className="results"
                                            onClick={() =>
                                                selectDestination(
                                                    location
                                                )
                                            }
                                        >
                                            <strong>
                                                {location.name}
                                            </strong>
                                            <br />
                                            {location.address}
                                        </li>
                                    )
                                )
                            ) : (
                                <li>No location found</li>
                            )}
                        </ul>
                    )}
                    <button type="submit" class="submit_button"> Generate Route </button>
                    <div className="section"> Transportation Modes </div>
                    <div className="switch_grid">
                        <Switch mode="MCTS"/>
                        <Switch mode="Prowl Line"/>
                        <Switch mode="U-PARK"/>
                        <Switch mode="The Hop"/>
                        <Switch mode="Bublr"/>
                    </div>
                    <div className="section"> Walking Preference </div>
                    <div className="range_container">
                        <input type="range"
                            id="pref"
                            min="0"
                            max="3"
                            step="0.1"
                            value={walkingDistance}
                            onChange={walkingPreference}/>
                        <label htmlFor="pref"> {walkingDistance} mi </label>
                    </div>
                </>
            )}
        </form>
    );
}

export default Navigation;