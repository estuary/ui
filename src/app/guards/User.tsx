import 'react-reflex/styles.css';

import { BaseComponentProps } from 'types';

import * as React from 'react';
import { useEffect } from 'react';

import { Navigate } from 'react-router';

import { Auth } from '@supabase/ui';

import { unauthenticatedRoutes } from 'app/routes';

import FullPageSpinner from 'components/fullPage/Spinner';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';

import { identifyUser } from 'services/logrocket';

function UserGuard({ children }: BaseComponentProps) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

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
                <Navigate
                    to={
                        grantToken
                            ? `${unauthenticatedRoutes.login.path}?${GlobalSearchParams.GRANT_TOKEN}=${grantToken}`
                            : unauthenticatedRoutes.login.path
                    }
                    replace
                />
            )}
        </React.Suspense>
    );
}

export default UserGuard;
