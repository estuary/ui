import AuthProvider from 'auth/Provider';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppContent from './AppContent';
import AppRouter from './AppRouter';
import AppTheme from './AppTheme';

ReactDOM.render(
    <React.StrictMode>
        <AppTheme>
            <AuthProvider>
                <AppContent>
                    <AppRouter>
                        <App />
                    </AppRouter>
                </AppContent>
            </AuthProvider>
        </AppTheme>
    </React.StrictMode>,
    document.querySelector('#root')
);
