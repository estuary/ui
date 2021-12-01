import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './AppRouter';
import AppTheme from './AppTheme';

ReactDOM.render(
    <React.StrictMode>
        <AppTheme>
            <AppRouter />
        </AppTheme>
    </React.StrictMode>,
    document.querySelector('#root')
);
