import * as React from 'react';
import FullPageSpinner from './components/fullPage/Spinner';
import { useAuth } from './context/Auth';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './apps/Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./apps/Unauthenticated'));

function App() {
    const { user } = useAuth();
    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
