import useClient from 'hooks/supabase-swr/hooks/useClient';
import LRU from 'lru-cache';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { ERROR_MESSAGES } from 'services/supabase';
import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';

export const singleCallSettings = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export const DEFAULT_POLLING = 2500;

const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const cache = () => {
        return new LRU({
            max: 500,
        });
    };

    const errorHandler = async (error: any) => {
        // Handle JWT tokens expiring
        if (error.message === ERROR_MESSAGES.jwtExpired) {
            await supabaseClient.auth
                .signOut()
                .then(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'login.jwtExpired',
                        }),
                        {
                            anchorOrigin: {
                                vertical: 'top',
                                horizontal: 'center',
                            },
                            variant: 'error',
                        }
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
