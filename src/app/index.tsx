import { Session } from '@supabase/supabase-js';
import FullPageSpinner from 'components/fullPage/Spinner';
import React, { useEffect, useState } from 'react';
import { supaClient } from 'services/supabase';



const AuthenticatedApp = React.lazy(
    () => import(/* webpackPrefetch: true */ './Authenticated')
);
const UnauthenticatedApp = React.lazy(() => import('./Unauthenticated'));

function App() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        setSession(supaClient.auth.session())

        supaClient.auth.onAuthStateChange((_event, sessionUpdate) => {
            setSession(sessionUpdate)
        })
    }, [])

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {session ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default App;
