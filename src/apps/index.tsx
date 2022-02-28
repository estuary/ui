import FullPageSpinner from 'components/FullPageSpinner';
import { useAuth } from 'context/Auth';
import * as React from 'react';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    const { user } = useAuth();
    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
