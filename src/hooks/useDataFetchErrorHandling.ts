import { useMemo } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { AUTH_ERROR } from 'src/services/client';
import { tokenHasIssues_GQL } from 'src/services/gql';
import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { tokenHasIssues } from 'src/services/supabase';

const SSO_REQUIRED_PREFIX = 'sso_required:';

function useDataFetchErrorHandling() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const setSsoNotSatisfied = useUserStore(
        (state) => state.setSsoNotSatisfied
    );

    return useMemo(() => {
        return {
            checkForSsoRequired: (
                message: string | undefined | null
            ): boolean => {
                if (message?.startsWith(SSO_REQUIRED_PREFIX)) {
                    const domain = message.slice(SSO_REQUIRED_PREFIX.length);
                    logRocketConsole(
                        'Auth:SSORequired - redirecting to SSO on token refresh',
                        domain
                    );
                    setSsoNotSatisfied(domain);
                    return true;
                }
                return false;
            },
            checkIfAuthInvalid: (message: string | undefined | null) => {
                return Boolean(
                    message &&
                        (message === AUTH_ERROR ||
                            tokenHasIssues(message) ||
                            tokenHasIssues_GQL(message))
                );
            },
            forceUserToSignOut: async (trigger: string) => {
                // This happens when a call to the server has returned a 401 but
                //      the UI thinks the User is still valid. So we need to log them out.
                logRocketEvent('Auth', {
                    signout: true,
                    trigger,
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
                        logRocketEvent('Auth', {
                            error: signOutError,
                            signout: true,
                            trigger,
                        });
                    });
            },
        };
    }, [enqueueSnackbar, intl, setSsoNotSatisfied]);
}

export default useDataFetchErrorHandling;
