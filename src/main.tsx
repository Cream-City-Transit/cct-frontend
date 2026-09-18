import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import Navigation from './control_inputs'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Navigation/>
        <App />
    </React.StrictMode>
);
