import React from "react";

function TrainIcon() {
    return (
        <svg
            className="train-icon"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Train"
        >
            {/* Train body */}
            <rect
                x="14"
                y="12"
                width="36"
                height="38"
                rx="5"
                fill="black"
            />

            {/* Front window */}
            <rect
                x="20"
                y="18"
                width="24"
                height="14"
                rx="2"
                fill="white"
            />

            {/* Left light */}
            <circle
                cx="22"
                cy="39"
                r="3"
                fill="white"
            />

            {/* Right light */}
            <circle
                cx="42"
                cy="39"
                r="3"
                fill="white"
            />

            {/* Connector */}
            <rect
                x="28"
                y="50"
                width="8"
                height="5"
                fill="black"
            />

            {/* Rails */}
            <path
                d="M18 55 L10 62"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <path
                d="M46 55 L54 62"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
            />

            <line
                x1="14"
                y1="60"
                x2="50"
                y2="60"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Top */}
            <rect
                x="29"
                y="7"
                width="6"
                height="5"
                fill="black"
            />

            <rect
                x="25"
                y="4"
                width="14"
                height="3"
                rx="1"
                fill="black"
            />
        </svg>
    );
}

export default TrainIcon;