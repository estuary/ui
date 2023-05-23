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

    return (
        <SWRConfig
            value={{
                provider: cache,
            }}
        >
            <SWRConfig
                value={{
                    onError: async (error, _key, _config) => {
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
                    },

                    // Start with a quick retry in case the problem was ephemeral
                    errorRetryInterval: 1000,

                    // TODO (SWR) this is nice but we need some UX built out before turning it back on
                    revalidateOnFocus: false,
                    dedupingInterval: 5000,
                }}
            >
                {children}
            </SWRConfig>
        </SWRConfig>
    );
};

export default SwrConfigProvider;
