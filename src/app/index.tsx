import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useTitle } from 'react-use';

const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'routeTitle.loginLoading',
        })
    );

    const { user } = Auth.useUser();

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
