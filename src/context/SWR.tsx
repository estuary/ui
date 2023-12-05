import useClient from 'hooks/supabase-swr/hooks/useClient';
import { LRUCache } from 'lru-cache';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';
import { logRocketConsole } from 'services/logrocket';
import { logRocketEvent } from 'services/shared';
import { ERROR_MESSAGES } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

export const DEFAULT_POLLING = 2500;
export const EXTENDED_POLL_INTERVAL = 30000;

export const singleCallSettings = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

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
    const { 1: setTokenInvalid } = useLocalStorage(
        LocalStorageKeys.TOKEN_INVALID
    );

    const cache = useCallback(() => {
        return new LRUCache({
            max: 100,
        });
    }, []);

    return (
        <SWRConfig
            value={{
                provider: cache,
            }}
        >
            <SWRConfig
                value={{
                    onError: async (error, _key, _config) => {
                        if (
                            error.message === ERROR_MESSAGES.jwtExpired ||
                            error.message === ERROR_MESSAGES.jwsInvalid
                        ) {
                            setTokenInvalid(true);
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
                                    logRocketConsole(
                                        'SWR:onError:failed to sign out',
                                        {
                                            signOutError,
                                        }
                                    );
                                });
                        }
                    },

                    onLoadingSlow: () => {
                        logRocketEvent(CustomEvents.SWR_LOADING_SLOW);
                    },

                    // Start with a quick retry in case the problem was ephemeral
                    errorRetryInterval: 1000,

                    // TODO (SWR) this is nice but we need some UX built out before turning it back on
                    revalidateOnFocus: false,
                    dedupingInterval: 3000,
                }}
            >
                {children}
            </SWRConfig>
        </SWRConfig>
    );
};

export default SwrConfigProvider;
