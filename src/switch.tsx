import React from 'react';

function Switch({mode}) {
    return (
        <div>
            <label className="switch">
                <input type="checkbox"/>
                <span className="slider"/>
            </label>
            <span className="mode"> {mode} </span>
        </div>
    )
}

export default Switch;