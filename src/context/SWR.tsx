import { logoutRoutes } from 'app/Unauthenticated';
import useClient from 'hooks/supabase-swr/hooks/useClient';
import LRU from 'lru-cache';
import { LogoutReasons } from 'pages/Login';
import { useNavigate } from 'react-router';
import { ERROR_MESSAGES } from 'services/supabase';
import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';
import { getPathWithParam } from 'utils/misc-utils';

export const singleCallSettings = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export const DEFAULT_POLLING = 2500;

const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const navigate = useNavigate();

    const cache = () => {
        return new LRU({
            max: 500,
        });
    };

    const errorHandler = (error: any) => {
        // Handle JWT tokens expiring
        if (error.message === ERROR_MESSAGES.jwtExpired) {
            supabaseClient.auth
                .signOut()
                .then(() => {
                    navigate(
                        getPathWithParam(
                            logoutRoutes.path,
                            logoutRoutes.params.reason,
                            LogoutReasons.JWT
                        ),
                        { replace: true }
                    );
                })
                .catch(() => {});
        }
    };

    return (
        <SWRConfig
            value={{
                provider: cache,
            }}
        >
            <SWRConfig
                value={{
                    onError: errorHandler,
                }}
            >
                {children}
            </SWRConfig>
        </SWRConfig>
    );
};

export default SwrConfigProvider;
