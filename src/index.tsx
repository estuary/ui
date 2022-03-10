import React from 'react';
import ReactDOM from 'react-dom';
import App from './apps';
import AppProviders from './context';

export const profilerCallback = (
    id: any,
    phase: any,
    actual: number,
    base: number,
    start: any,
    commit: any,
    inter: any
) => {
    console.log(`Render ${id} in ${actual}`);
    console.log('  Time > ', { actual, base, commit, start });
    console.log('  Deet > ', { inter, phase });
};

ReactDOM.render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
    document.querySelector('#root')
);
