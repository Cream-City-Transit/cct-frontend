import React, { useState } from 'react';

export type Coordinates = {
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

export type Point = {
    lat: number;
    lon: number;
}

export type RoutePart = {
    mode: string;
    geometry: Point[];
}

export type Route = {
    legs: RoutePart[];
}

function Submitted(event: React.FormEvent<HTMLFormElement>, originCoords: Coordinates, destinationCoords: Coordinates, modes: string[], getRoute: (route: Route[]) => void) {
    event.preventDefault();

    //send lat/long data to the backend, receive it and display it on page
    fetch('http://localhost:3000/api/routes', {
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originLat: originCoords.lat,
                originLon: originCoords.lon,
                destinationLat: destinationCoords.lat,
                destinationLon: destinationCoords.lon,
                modes: modes
            }),
    })
        .then((response) => {
            //return the generated route 
            return response.json();
        })
        .then((displayRoute : Route[]) => {
            //pass the generated route, if no route is found then display an error message
            if (displayRoute.length > 0) {
                getRoute(displayRoute);
                alert(JSON.stringify(displayRoute));
            }
            else{
                alert("No route found.");
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export default Submitted;