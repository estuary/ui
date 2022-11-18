import 'consent-manager/dist/consent-manager.css';
import 'polyfills/transformStream';

import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import { initTracking } from 'services/tracking';
import App from './app';
import AppProviders from './context';

// export const profilerCallback = (
//     id: any,
//     phase: any,
//     actual: number,
//     base: number,
//     start: any,
//     commit: any,
//     inter: any
// ) => {
//     console.log(`Render ${id} in ${actual}`);
//     console.log('  Time > ', { actual, base, commit, start });
//     console.log('  Deet > ', { inter, phase });
// };

initTracking();
enableMapSet();

ReactDOM.render(
    <React.StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </React.StrictMode>,
    document.querySelector('#root')
);
