import React, { useState } from 'react';
import Submitted from './submission';
import Switch from './switch';
import { Place, usePlaceSearch } from './geocoder';
import type { Route } from './submission';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import {Stop} from "@opentripplanner/types";
import ViewStops from "./fetchStops";
import { BusStop } from 'iconoir-react';

type Coordinates = {
    lat: number;
    lon: number;
};

type ControlInputsProps = {
    setHasGeneratedRoute: React.Dispatch<React.SetStateAction<boolean>>;
    originCoords: Coordinates;
    destinationCoords: Coordinates;
    setOriginCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
    setDestinationCoords: React.Dispatch<React.SetStateAction<Coordinates>>;
    origin: string;
    destination: string;
    setOrigin: (value: string) => void;
    setDestination: (value: string) => void;
    modes: string[];
    setModes: React.Dispatch<React.SetStateAction<string[]>>;
    getRoute: (route: Route[]) => void;
    getStops: (stops: Stop[]) => void;
    onSwap: () => void;
    onUseLocation: () => void;
    clearRoute: () => void;
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
    onSwap,
    onUseLocation,
    clearRoute,
    setHasGeneratedRoute,
    originCoords,
    destinationCoords,
    setOriginCoords,
    setDestinationCoords,
    origin,
    destination,
    setOrigin,
    setDestination,
    modes,
    setModes,
    getRoute,
    getStops
}: ControlInputsProps) {

    const [minimized, setMinimized] = useState(false);
    const [originView, setOriginView] = useState(false);
    const [destinationView, setDestinationView] = useState(false);
    const [walkingDistance, setWalkingDistance] = useState(1);

    const originResults = usePlaceSearch(origin, originView);
    const destinationResults = usePlaceSearch(destination, destinationView);

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
        clearRoute(); // the start point changed, so the old route is stale
        setOrigin(place.address || place.name);
        setOriginCoords({ lat: place.lat, lon: place.lon });
        setOriginView(false);
    };

    // Destination
    const selectDestination = (place: Place) => {
        clearRoute(); // the end point changed, so the old route is stale
        setDestination(place.address || place.name);
        setDestinationCoords({ lat: place.lat, lon: place.lon });
        setDestinationView(false);
    };

    const walkingPreference = (preference:React.ChangeEvent<HTMLInputElement>) => {
        setWalkingDistance(preference.target.valueAsNumber);
    };

    const toggleMode = (mode: string) => {
        setModes((prev) => {
            if (prev.includes(mode)) {
                return prev.filter((m) => m !== mode);
            } else {
                return [...prev, mode];
            }
        });
    };

    return (
        <form className={`navigation ${minimized ? "minimized" : ""}`} onSubmit={(e) => {
        setHasGeneratedRoute(true);
        Submitted(e, originCoords, destinationCoords,modes, getRoute)}}>

            <button type="button" className="minimize_button" onClick={() => {setMinimized(!minimized)}}>
                {minimized ? "▲" : "▼"}
            </button>

            {minimized && (
                <>
                    <Accordion slotProps={{ heading: { component: 'h2' } }} defaultExpanded={true} sx={{width: 300 , background: '#4A70A9', color: 'white', fontSize: '30px'}}>
                        <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Navigate
                        </AccordionSummary>
                        <AccordionDetails sx={{background: 'white', color: '#3B444B'}}>
                            <input type="search" className="search" value={origin} id="origin" placeholder="Starting Location" onChange={handleSearch}/><br/>
                            {originView && origin && (
                                <Suggestions results={originResults} onSelect={selectOrigin} />
                            )}
                            <button
                                type="button"
                                className="location_button"
                                onClick={onUseLocation}
                                title="Use my current location as the starting point"
                            >
                                📍 Use my location
                            </button>
                            <button
                                type="button"
                                className="swap_button"
                                onClick={onSwap}
                                title="Swap starting location and destination"
                            >
                                ⇅
                            </button>
                            <input type="search" className="search" value={destination} id="destination" placeholder="Destination" onChange={handleSearch}/><br/>
                            {destinationView && destination && (
                                <Suggestions results={destinationResults} onSelect={selectDestination} />
                            )}
                            <button type="submit" className="submit_button"> Generate Route </button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion slotProps={{ heading: { component: 'h4' } }} defaultExpanded={true} sx={{width: 300 , background: '#4A70A9', color: 'white'}}>
                        <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Transportation Modes
                        </AccordionSummary>
                        <AccordionDetails sx={{background: 'white', color: '#3B444B'}}>
                            <div className="switch_grid">
                                <Switch mode="MCTS" state={modes.includes("MCTS") ? "On" : "Off"} checked={modes.includes("MCTS")} onToggle={toggleMode}/>
                                <Switch mode="Prowl Line" state={modes.includes("Prowl Line") ? "On" : "Off"} checked={modes.includes("Prowl Line")} onToggle={toggleMode}/>
                                <Switch mode="U-PARK" state={modes.includes("U-PARK") ? "On" : "Off"} checked={modes.includes("U-PARK")} onToggle={toggleMode}/>
                                <Switch mode="The Hop" state={modes.includes("The Hop") ? "On" : "Off"} checked={modes.includes("The Hop")} onToggle={toggleMode}/>
                                <Switch mode="Bublr" state={modes.includes("Bublr") ? "On" : "Off"} checked={modes.includes("Bublr")} onToggle={toggleMode}/>
                            </div>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion slotProps={{ heading: { component: 'h4' } }} sx={{width: 300, background: '#4A70A9', color: 'white'}}>

                        <AccordionSummary
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Walking Preference
                        </AccordionSummary>
                        <AccordionDetails sx={{background: 'white', color: '#3B444B'}}>
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
                        </AccordionDetails>
                    </Accordion>

                    <Accordion slotProps={{ heading: { component: 'h4' } }} sx={{width: 300, background: '#4A70A9', color: 'white'}}>

                        <AccordionSummary
                            aria-controls="panel1-content"
                            id="stops"
                        >
                            Stops
                        </AccordionSummary>

                        <AccordionDetails sx={{background: 'white', color: '#3B444B'}}>
                            <button
                                type="button"
                                className="stops_button"
                                onClick={(e) => {ViewStops(e, getStops)}}
                                title="View bus stops on the map"
                            >
                                <BusStop/> View Stops
                            </button>
                        </AccordionDetails>

                    </Accordion>

                </>
            )}
        </form>
    );
}

export default Navigation;