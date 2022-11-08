import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import 'react-reflex/styles.css';
import AppGuards from './guards';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    return (
        <AppGuards>
            <React.Suspense fallback={<FullPageSpinner />}>
                <AuthenticatedApp />
            </React.Suspense>
        </AppGuards>
    );
}

export default App;
