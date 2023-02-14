import { Auth } from '@supabase/ui';
import FullPageSpinner from 'components/fullPage/Spinner';
import * as React from 'react';
import { useEffect } from 'react';
import 'react-reflex/styles.css';
import { Navigate } from 'react-router';
import { identifyUser } from 'services/logrocket';
import { BaseComponentProps } from 'types';

function UserGuard({ children }: BaseComponentProps) {
    const { user } = Auth.useUser();

    useEffect(() => {
        console.log('UserGuard- user', user);
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    console.log('UserGuard');

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? children : <Navigate to="/login" replace />}
        </React.Suspense>
    );
}

export default UserGuard;
