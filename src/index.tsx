import 'index.css';
import 'polyfills/transformStream';

import ApplicationRouter from 'context/Router';
import React from 'react';
import ReactDOM from 'react-dom';
import AppProviders from './context';

ReactDOM.render(
    <React.StrictMode>
        <AppProviders>
            <ApplicationRouter />
        </AppProviders>
    </React.StrictMode>,
    document.querySelector('#root')
);
