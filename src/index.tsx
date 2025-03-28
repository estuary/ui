import 'src/index.css';
import 'src/polyfills/transformStream';

import React from 'react';

import AppProviders from './context';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import ReactDOM from 'react-dom';

import ApplicationRouter from 'src/context/Router';

// Setup Monaco - not in GlobalProviders to make test setup easier for now
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
