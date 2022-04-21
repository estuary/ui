import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import useBrowserTitle from 'hooks/useBrowserTitle';
import * as React from 'react';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    useBrowserTitle('browserTitle.loginLoading');

    const { user } = Auth.useUser();

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
