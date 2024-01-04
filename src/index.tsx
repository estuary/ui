import 'index.css';
import 'polyfills/transformStream';

import ApplicationRouter from 'context/Router';
import { enableMapSet, setAutoFreeze } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import { initGoogleTagManager } from 'services/gtm';
import { initLogRocket } from 'services/logrocket';

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

import AppProviders from './context';

initGoogleTagManager();
initLogRocket();

// TODO (logrocket | compliance)
// Eventually we need to make sure to not include LR for certain tenants
//  that have some setting enabled. Eventually this check should just set
//  a variable that is then consumer deeper in the application (once we have the tenant)
//  and then we can load in the file

// TODO (integrity | logrocket)
// This code chunk can be put back in if we want to load in LogRocket manually
// if (
//     import.meta.env.VITE_LOGROCKET_ENABLED === 'true' &&
//     import.meta.env.VITE_LOGROCKET_URL !== ''
// ) {
//     const LR_INTEGRITY = `${import.meta.env.VITE_LOGROCKET_SHA_ENCODING}-${
//         import.meta.env.VITE_LOGROCKET_SHA
//     }`;
//     if (LR_INTEGRITY !== '-') {
//         (() => {
//             const script = document.createElement('script');
//             script.async = true;
//             script.crossOrigin = 'crossorigin';
//             script.integrity = LR_INTEGRITY;
//             script.src = import.meta.env.VITE_LOGROCKET_URL;

//             // Once loaded we can init LogRocket
//             script.onload = () => {
//                 initLogRocket();
//             };

//             document.body.appendChild(script);
//         })();
//     }
// }

// Setup immer
enableMapSet();
setAutoFreeze(false);

// Setup Monaco
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new JsonWorker();
        }
        return new EditorWorker();
    },
};
loader.config({ monaco });

ReactDOM.render(
    <React.StrictMode>
        <AppProviders>
            <ApplicationRouter />
        </AppProviders>
    </React.StrictMode>,
    document.querySelector('#root')
);
