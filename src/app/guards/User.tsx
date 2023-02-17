import { Auth } from '@supabase/ui';
import { unauthenticatedRoutes } from 'app/routes';
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
        if (user) {
            identifyUser(user);
        }
    }, [user]);

    return (
        <React.Suspense fallback={<FullPageSpinner />}>
            {user ? (
                children
            ) : (
                <Navigate to={unauthenticatedRoutes.login.path} replace />
            )}
        </React.Suspense>
    );
}

export default UserGuard;
