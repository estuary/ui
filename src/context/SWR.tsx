import type { BaseComponentProps } from 'types';
import LRUMapWithDelete from 'mnemonist/lru-map-with-delete';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { AUTH_ERROR } from 'services/client';
import { logRocketConsole, logRocketEvent } from 'services/shared';
import { tokenHasIssues } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { SWRConfig, useSWRConfig } from 'swr';
import { supabaseClient } from './GlobalProviders';

const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_POLLING = 2500;
export const EXTENDED_POLL_INTERVAL = 30000;

export const singleCallSettings = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export const extendedPollSettings = {
    errorRetryCount: DEFAULT_RETRY_COUNT,
    errorRetryInterval: EXTENDED_POLL_INTERVAL / 2,
    refreshInterval: EXTENDED_POLL_INTERVAL,
    revalidateOnFocus: false,
};
const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const { onErrorRetry } = useSWRConfig();

    const provider = useCallback(() => {
        return new LRUMapWithDelete<string, any>(500);
    }, []);

    return (
        <SWRConfig
            value={{
                // https://supabase-cache-helpers.vercel.app/configuration
                provider,
                revalidateIfStale: false,
                revalidateOnFocus: false,

                // TODO (V2 Perf) the new cache works REALLY well... but we are not ready for that yet. One of
                //  the main issues is stuff like Live Specs that are updated through publications and not through
                //  using the mutation calls.
                revalidateOnMount: true,
            }}
        >
            <SWRConfig
                value={{
                    onErrorRetry: (
                        err,
                        key,
                        config,
                        revalidate,
                        revalidateOpts
                    ) => {
                        // The server says they do not have access so don't try again
                        if (
                            err &&
                            (err === AUTH_ERROR || err.message === AUTH_ERROR)
                        ) {
                            return;
                        }

                        // Make sure we don't spam ourselves so stop eventually
                        if (revalidateOpts.retryCount >= DEFAULT_RETRY_COUNT) {
                            return;
                        }

                        // Continue on using the normal retry handled so we get the exponential backoff
                        onErrorRetry(
                            err,
                            key,
                            config,
                            revalidate,
                            revalidateOpts
                        );
                    },
                    onError: async (error, _key, _config) => {
                        // This happens when a call to the server has returned a 401 but
                        //      the UI thinks the User is still valid. So we need to log them out.
                        if (
                            error.message === AUTH_ERROR ||
                            tokenHasIssues(error.message)
                        ) {
                            logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
                                trigger: 'swr',
                            });
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
                                            // TODO (notification)
                                            // If we ever let people log back in without navigation away first
                                            //  this notification will always show and never go away.
                                            persist: true,
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

                    onLoadingSlow: (key) => {
                        logRocketEvent(CustomEvents.SWR_LOADING_SLOW, {
                            key,
                        });
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
