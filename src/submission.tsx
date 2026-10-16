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

function Submitted(event: React.FormEvent<HTMLFormElement>, originCoords: Coordinates, destinationCoords: Coordinates) {
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
            }),
    })
        .then((response) => response.json())
        .then((displayRoute) => {
            alert(JSON.stringify(displayRoute));
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}



export default Submitted;