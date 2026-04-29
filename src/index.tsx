import 'src/index.css';
import 'src/polyfills/transformStream';

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import { createRoot } from 'react-dom/client';

import AppProviders from 'src/context';
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

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    // <StrictMode>
    <AppProviders>
        <ApplicationRouter />
    </AppProviders>
    // </StrictMode>
);
