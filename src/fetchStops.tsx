import React from 'react';
import {Stop} from "@opentripplanner/types";


function RequestStops(
    id: string,
    getStops: (stops: Stop[]) => void
):void{
    fetch('http://localhost:3000/api/stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({agency_id: id}),
    })
    .then((response) => {
        return response.json();
    })
    .then((displayStops: Stop[]) => {
        getStops(displayStops);
        console.log(JSON.stringify(displayStops));
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function ViewStops(
    event: React.MouseEvent<HTMLButtonElement>,
    id: string,
    getStops: (stops: Stop[]) => void
) {
    event.preventDefault();
    RequestStops(id, getStops);
}

export default ViewStops;