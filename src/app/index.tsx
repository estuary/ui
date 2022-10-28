import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import 'react-reflex/styles.css';
import AppGuards from './guards';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    console.log('1');

    return (
        <AppGuards>
            <AuthenticatedApp />
        </AppGuards>
    );
}

export default App;
