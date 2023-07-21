import { useSnackbar } from 'notistack';
import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';
import { LRUCache } from 'lru-cache';
import { useIntl } from 'react-intl';

import useClient from 'hooks/supabase-swr/hooks/useClient';

import { ERROR_MESSAGES } from 'services/supabase';

export const singleCallSettings = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export const DEFAULT_POLLING = 2500;

export const EXTENDED_POLL_INTERVAL = 30000;

export const extendedPollSettings = {
    errorRetryCount: 3,
    errorRetryInterval: EXTENDED_POLL_INTERVAL / 2,
    refreshInterval: EXTENDED_POLL_INTERVAL,
    revalidateOnFocus: false,
};

const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const supabaseClient = useClient();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const cache = () => {
        return new LRUCache({
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
                                .catch((signOutError) => {
                                    console.log(
                                        'SWR:onError:failed to sign out',
                                        {
                                            signOutError,
                                        }
                                    );
                                });
                        }
                    },

                    // Start with a quick retry in case the problem was ephemeral
                    errorRetryInterval: 2500,

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
