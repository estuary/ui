import { Auth } from '@supabase/ui';
import { unauthenticatedRoutes } from 'app/routes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect } from 'react';
import 'react-reflex/styles.css';
import { Navigate } from 'react-router';
import { identifyUser } from 'services/logrocket';
import { BaseComponentProps } from 'types';

function UserGuard({ children }: BaseComponentProps) {
    const grantToken = useGlobalSearchParams(GlobalSearchParams.GRANT_TOKEN);

    const { user } = Auth.useUser();

    useEffect(() => {
        if (user) {
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
