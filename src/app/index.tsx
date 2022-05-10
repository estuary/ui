import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';
import { identifyUser } from 'services/logrocket';
import { getUserDetails } from 'services/supabase';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    const { user } = Auth.useUser();

    if (user) {
        const userDetails = getUserDetails(user);
        identifyUser(user.id, userDetails.userName, userDetails.email);
    }

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
