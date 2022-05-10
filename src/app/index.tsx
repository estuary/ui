import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import { useEffect } from 'react';
import { identifyUser } from 'services/logrocket';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    const { user } = Auth.useUser();

    useEffect(() => {
        if (user) {
            console.log('this was called');
            identifyUser(user);
        }
    }, [user]);

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
