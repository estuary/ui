import { Auth as SupabaseAuth } from '@supabase/ui';
import { authenticatedRoutes, REDIRECT_TO_PARAM_NAME } from 'app/routes';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useClient } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// This is the main "controller" for checking auth status for Supabase when coming into the app
//    - This is used for both OIDC auth AND magic link auth.
//    - We call their API to check for errors so we don't have to pull that logic into our app.
//    - The error message Supabase puts in the URL is the one we display... should probably handle custom messages sometime.
//    - If there are ANY issues logging in we will log the user out.
const Auth = () => {
    useBrowserTitle('routeTitle.loginLoading');

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const supabaseClient = useClient();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = SupabaseAuth.useUser();

    useEffect(() => {
        const failed = async (error: string) => {
            enqueueSnackbar(error, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                preventDuplicate: true,
                variant: 'error',
            });
            await supabaseClient.auth.signOut();
        };

        const success = () => {
            const redirectParam = searchParams.get(REDIRECT_TO_PARAM_NAME);
            navigate(
                (redirectParam && decodeURIComponent(redirectParam)) ??
                    authenticatedRoutes.home.path
            );
        };

        if (!user) {
            supabaseClient.auth
                .getSessionFromUrl({
                    storeSession: true,
                })
                .then(async (response) => {
                    if (response.error) {
                        await failed(response.error.message);
                    }

                    success();
                })
                .catch(() => {});
        } else {
            success();
        }
    });

    return <FullPageSpinner />;
};

export default Auth;
