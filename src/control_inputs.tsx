import { useState } from 'react';

function Navigation() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    return (
        <form>
            <input type="text" value={origin} placeholder="Starting Location"
                   onChange={(location) => setOrigin(location.target.value)}/><br/>
            <input type="text" value={destination} placeholder="Destination"
                   onChange={(location) => setDestination(location.target.value)}/><br/>
            <button type="submit">Search</button>
        </form>
    )
}

export default Navigation;