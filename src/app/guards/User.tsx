import { useEffect, useRef } from 'react';

import { unauthenticatedRoutes } from 'src/app/routes';
import { useUserStore } from 'src/context/User/useUserContextStore';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

import 'react-reflex/styles.css';

import type { BaseComponentProps } from 'src/types';

import { Navigate } from 'react-router';

import { identifyUser } from 'src/services/logrocket';

function UserGuard({ children }: BaseComponentProps) {
    // We only want to idenfity users once. Since the user object changes
    //  everytime the user focuses on the tab we could end up spamming calls.
    const identifiedUser = useRef(false);
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        if (user && !identifiedUser.current) {
            identifiedUser.current = true;
            identifyUser(user);
        }
    }, [user]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
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
        </>
    );
}

export default UserGuard;
