import 'polyfills/transformStream';

import ApplicationRouter from 'context/Router';
import { enableMapSet, setAutoFreeze } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import { initGoogleTagManager } from 'services/gtm';
import { initLogRocket } from 'services/logrocket';
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

initGoogleTagManager();
initLogRocket();

// Setup immer
enableMapSet();
setAutoFreeze(false);

ReactDOM.render(
    <React.StrictMode>
        <AppProviders>
            <ApplicationRouter />
        </AppProviders>
    </React.StrictMode>,
    document.querySelector('#root')
);
