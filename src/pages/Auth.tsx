import { useEffect, useRef } from 'react';

import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
    authenticatedRoutes,
    REDIRECT_TO_PARAM_NAME,
    unauthenticatedRoutes,
} from 'src/app/routes';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import useBrowserTitle from 'src/hooks/useBrowserTitle';
import { logRocketEvent } from 'src/services/shared';
import type { CommonStatuses} from 'src/services/types';
import { CustomEvents } from 'src/services/types';

const trackEvent = (status: CommonStatuses) => {
    logRocketEvent(CustomEvents.LOGIN, {
        status: `getSessionFromUrl ${status}`,
    });
};

// This is the main "controller" for checking auth status for Supabase when coming into the app
//    - This is used for both OIDC auth AND magic link auth.
//    - We call their API to check for errors so we don't have to pull that logic into our app.
//    - The error message Supabase puts in the URL is the one we display... should probably handle custom messages sometime.
//    - If there are ANY issues logging in we will log the user out.
const Auth = () => {
    useBrowserTitle('routeTitle.loginLoading');

    // Storing if we are in the process of saving the user
    // That way we do not keep spamming the Supabase Client
    const savingUser = useRef(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // We can fetch user here and not session because we are
    //  potentially creating the session here down below.
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        // If we have already processed we do not need to try getting
        //  the session from the URL again
        if (savingUser.current) {
            trackEvent('skipped');
            return;
        }

        const failed = async (error: string) => {
            enqueueSnackbar(error, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                preventDuplicate: true,
                variant: 'error',
            });

            savingUser.current = false;
            await supabaseClient.auth.signOut();
            navigate(unauthenticatedRoutes.login.path, { replace: true });
        };

        const success = () => {
            const redirectParam = searchParams.get(REDIRECT_TO_PARAM_NAME);
            navigate(
                (redirectParam && decodeURIComponent(redirectParam)) ??
                    authenticatedRoutes.home.path
            );
        };

        if (!user) {
            savingUser.current = true;
            supabaseClient.auth
                .initialize()
                .then(async (response) => {
                    if (response.error) {
                        trackEvent('failed');
                        await failed(response.error.message);
                    } else {
                        trackEvent('success');
                        success();
                    }
                })
                .catch(async (error) => {
                    trackEvent('exception');
                    await failed(error.message);
                });
        } else {
            trackEvent('skipped');
            success();
        }
    });

    return <FullPageSpinner />;
};

export default Auth;
