import React from 'react';
import { useState } from 'react';
import Switch from './switch';

function Navigation() {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
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
    const filterSearch = (selectedSearchBar) => test.filter((list) =>
        // case-sensitive by default -> convert both the list and input to lowercase
        (list.address.toLowerCase().includes(selectedSearchBar.toLowerCase()))
        || list.name.toLowerCase().includes(selectedSearchBar.toLowerCase()));
    const generate_route = (search) => {
        // prevents reloading the entire page
        search.preventDefault();
        // placeholder
        alert(`from ${origin} to ${destination}`);
    };
    const handleSearch = (search) => {
        // check which search bar triggered event
        if(search.target.id==="origin"){
            setOrigin(search.target.value);
            if (!originView) setOriginView(true);
        }
        else
            setDestination(search.target.value);
            if (!destinationView) setDestinationView(true);
    }
    return (
        <form className={`navigation ${minimized ? "minimized" : ""}`} onSubmit={generate_route}>
            <button type="button" className="minimize_button" onClick={() => {setMinimized(!minimized)}}>
                {minimized ? "▲" : "▼"}
            </button>
            {minimized && (
                <>
                    <input type="search" value={origin} id="origin" placeholder="Starting Location" onChange={handleSearch}/><br/>
                    {originView && origin && (
                        <ul className="results-container">
                            {filterSearch(origin).length > 0 ? (filterSearch(origin).map((input) => (
                                <li key={input.id} className="results" onClick={() => (setOriginView(!originView), setOrigin(input.address))}>
                                    {input.address}
                                </li>))) :(
                                <li> No location found </li>)}
                        </ul>
                    )}
                    <input type="search" value={destination} id="destination" placeholder="Destination" onChange={handleSearch}/><br/>
                    {destinationView && destination && (
                        <ul className="results-container">
                            {filterSearch(destination).length > 0 ? ( filterSearch(destination).map((input) => (
                                <li key={input.id} className="results" onClick={() => (setDestinationView(!destinationView), setDestination(input.address))}>
                                    {input.address}
                                </li>))) : (
                                <li> No location found </li>)}
                        </ul>
                    )}
                    <button type="submit"> Generate Route </button><br/>

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