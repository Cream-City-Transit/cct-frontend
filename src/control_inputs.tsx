import React from 'react';
import { useState } from 'react';
import Switch from './switch';

function Submitted(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    //send lat/long data to the backend, receive it and display it on page
    fetch('http://localhost:3000/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originLat: 42.99189,
                originLon: -88.01563,
                destinationLat: 42.92801,    
                destinationLon: -87.85251,
            })
        })
        .then(response => response.json())
        .then(displayRoute => alert(JSON.stringify(displayRoute)))
        .catch(error => console.error('Error:', error))
}

function Navigation() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [minimized, setMinimized] = useState(false);

    return (
        
        <form className={`navigation ${minimized ? "minimized" : ""}`} onSubmit={Submitted}>
            <button type="button" className="minimize_button" onClick={() => setMinimized(!minimized)}>
                {minimized ? "▲" : "▼"}
            </button>
            {!minimized && (
                <>
                    <input type="text" className="search_input" value={origin} placeholder="Starting Location"
                    onChange={(location) => setOrigin(location.target.value)}/><br/>
                    <input type="text" className="search_input" value={destination} placeholder="Destination"
                    onChange={(location) => setDestination(location.target.value)}/><br/>
                    <button onClick={() => console.log("Search button clicked")} type="submit">Search</button><br/>

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