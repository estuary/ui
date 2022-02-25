import * as React from 'react';
import FullPageSpinner from './components/FullPageSpinner';
import { useAuth } from './context/Auth';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './App-Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./App-Unauthenticated'));

function App() {
    const { user } = useAuth();
    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
