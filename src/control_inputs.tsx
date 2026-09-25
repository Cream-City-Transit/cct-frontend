import React from 'react';
import { useState } from 'react';
import Switch from './switch';
function Navigation() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    return (
        <form className="navigation">
            <input type="text" className="search_input" value={origin} placeholder="Starting Location"
                   onChange={(location) => setOrigin(location.target.value)}/><br/>
            <input type="text" className="search_input" value={destination} placeholder="Destination"
                   onChange={(location) => setDestination(location.target.value)}/><br/>
            <button type="submit">Search</button><br/>

            <Switch mode="MCTS"/>
            <Switch mode="Prowl Line"/>
            <Switch mode="U-PARK"/>
            <Switch mode="The Hop"/>
        </form>
    )
}

export default Navigation;