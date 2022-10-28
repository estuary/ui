import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import * as React from 'react';
import { useEffect } from 'react';
import 'react-reflex/styles.css';
import { identifyUser } from 'services/logrocket';
import { BaseComponentProps } from 'types';

const UnauthenticatedApp = React.lazy(() => import('../Unauthenticated'));

function UserGuard({ children }: BaseComponentProps) {
    console.log('Guards:User');

    const { user } = Auth.useUser();

    useEffect(() => {
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? children : <UnauthenticatedApp />}
        </React.Suspense>
    );
}

export default UserGuard;
