import React, {useState} from 'react';
import {Stop} from "@opentripplanner/types";

let fetched:Promise<void> = null;

function RequestStops(
    getStops: (stops: Stop[]) => void
):void{
    if(!fetched){
        fetched = fetch('http://localhost:3000/api/stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        })
        .then((response) => {
            //return the generated route
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
}

function ViewStops(
    event: React.FormEvent<HTMLFormElement>,
    getStops: (stops: Stop[]) => void
) {
    event.preventDefault();
    RequestStops(getStops);
}

export default ViewStops;