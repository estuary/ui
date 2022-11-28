import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import 'react-reflex/styles.css';

import CliAuthContextLayout from 'components/cli/CliAuthContextLayout';
import { CliAuthSuccess } from 'components/cli/CliAuthSuccess';
import { CliLogin } from 'components/cli/CliLogin';
import { Route, Routes } from 'react-router';
import AppGuards from './guards';
import { unauthenticatedRoutes } from './routes';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    return (
        <Routes>
            <Route
                path={unauthenticatedRoutes.cliAuth.path}
                element={<CliAuthContextLayout />}
            >
                <Route
                    path={unauthenticatedRoutes.cliAuth.login.path}
                    element={<CliLogin />}
                />
                <Route
                    path={unauthenticatedRoutes.cliAuth.success.path}
                    element={<CliAuthSuccess />}
                />
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
