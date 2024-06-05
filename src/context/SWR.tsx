import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { AUTH_ERROR } from 'services/client';
import { logRocketConsole, logRocketEvent } from 'services/shared';
import { supabaseClient, tokenHasIssues } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { SWRConfig, useSWRConfig } from 'swr';
import { BaseComponentProps } from 'types';

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

    return (
        <SWRConfig
            value={{
                // https://supabase-cache-helpers.vercel.app/configuration
                revalidateIfStale: false,
                revalidateOnFocus: false,
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
                        const localUserInvalid =
                            error.message === AUTH_ERROR &&
                            Boolean(supabaseClient.auth.user());

                        if (localUserInvalid || tokenHasIssues(error.message)) {
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
