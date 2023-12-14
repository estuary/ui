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
