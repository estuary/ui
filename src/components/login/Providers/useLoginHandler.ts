import type { Provider } from '@supabase/supabase-js';
import type { SupportedProvider } from 'src/types/authProviders';

import { useCallback, useMemo } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { unauthenticatedRoutes } from 'src/app/routes';
import { supabaseClient } from 'src/context/GlobalProviders';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import useLoginRedirectPath from 'src/hooks/searchParams/useLoginRedirectPath';
import { getPathWithParams } from 'src/utils/misc-utils';

// TODO (routes) This is hardcoded because unauthenticated routes... (same as MagicLink)
const redirectToBase = `${window.location.origin}/auth`;

function useLoginHandler(grantToken?: string, isRegister?: boolean) {
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();
    const redirectTo = useLoginRedirectPath(redirectToBase);

    const loginFailed = useCallback(
        (key: Provider) => {
            enqueueSnackbar(
                intl.formatMessage({
                    id: `login.${
                        isRegister ? 'registerFailed' : 'loginFailed'
                    }.${key}`,
                }),
                {
                    anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                    },
                    preventDuplicate: true,
                    variant: 'error',
                }
            );
        },
        [enqueueSnackbar, intl, isRegister]
    );

    const login = useCallback(
        async (
            provider: SupportedProvider,
            scopes?: string,
            queryParams?: any
        ) => {
            const redirectBaseURL = isRegister
                ? `${window.location.origin}${unauthenticatedRoutes.register.callback.fullPath}`
                : redirectTo;

            try {
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: grantToken
                            ? getPathWithParams(redirectBaseURL, {
                                  [GlobalSearchParams.GRANT_TOKEN]: grantToken,
                              })
                            : redirectBaseURL,
                        scopes,
                        queryParams,
                        // TODO (SBv2) this is not here anymore - need to figure out if it is important
                        // shouldCreateUser: isRegister,
                    },
                });
                if (error) loginFailed(provider);
            } catch (error: unknown) {
                loginFailed(provider);
            }
        },
        [grantToken, isRegister, loginFailed, redirectTo]
    );

    return useMemo(
        () => ({
            login,
            loginFailed,
        }),
        [login, loginFailed]
    );
}

export default useLoginHandler;
