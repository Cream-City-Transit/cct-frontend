import React from 'react';
import { useState } from 'react';
import Switch from './switch';

function Navigation() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [minimized, setMinimized] = useState(false);

    return (
        <form className={`navigation ${minimized ? "minimized" : ""}`}>
            <button type="button" className="minimize_button" onClick={() => setMinimized(!minimized)}>
                {minimized ? "▲" : "▼"}
            </button>
            {!minimized && (
                <>
                    <input type="text" className="search_input" value={origin} placeholder="Starting Location"
                    onChange={(location) => setOrigin(location.target.value)}/><br/>
                    <input type="text" className="search_input" value={destination} placeholder="Destination"
                    onChange={(location) => setDestination(location.target.value)}/><br/>
                    <button type="submit">Search</button><br/>

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