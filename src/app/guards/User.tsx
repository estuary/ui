import { Auth } from '@supabase/ui';
import { unauthenticatedRoutes } from 'app/routes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useRef } from 'react';
import 'react-reflex/styles.css';
import { Navigate } from 'react-router';
import { identifyUser } from 'services/logrocket';
import { BaseComponentProps } from 'types';

function UserGuard({ children }: BaseComponentProps) {
    // We only want to idenfity users once. Since the user object changes
    //  everytime the user focuses on the tab we could end up spamming calls.
    const identifiedUser = useRef(false);
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);
    const { user } = Auth.useUser();

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
