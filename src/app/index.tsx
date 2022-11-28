import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import 'react-reflex/styles.css';

import { CliLogin } from 'components/CliLogin';
//import { CliAuthSuccess } from 'components/CliAuthSuccess';
import { Route, Routes } from 'react-router';
//import { Login } from 'pages/Login';
import CliAuthContextLayout from 'components/CliAuthContextLayout';
import AppGuards from './guards';
import { authenticatedRoutes } from './routes';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    return (
        <Routes>
            <Route
                path={authenticatedRoutes.cliAuth.path}
                element={<CliAuthContextLayout />}
            >
                <Route path="*" element={<CliLogin />} />
            </Route>
            <Route
                path="*"
                element={
                    <AppGuards>
                        <React.Suspense fallback={<FullPageSpinner />}>
                            <AuthenticatedApp />
                        </React.Suspense>
                    </AppGuards>
                }
            />
        </Routes>
    );
}

export default App;
