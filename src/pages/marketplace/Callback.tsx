import { useEffect } from 'react';

import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import useMarketplaceLocalStorage from 'src/hooks/useMarketplaceLocalStorage';
import { logRocketConsole } from 'src/services/shared';
import { supabaseClient } from 'src/services/supabaseClient';

// Expanding Marketplace Providers
// Once we add more providers the idea is to do something like this
// const provider = useGlobalSearchParams<MarketPlaceProviders>(
//     GlobalSearchParams.PROVIDER
// );
// if (provider === 'google') {
//     return <GoogleMarketplaceCallback />;
// }

function MarketplaceCallback() {
    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();

    const { 1: setMarketplaceVerify } = useMarketplaceLocalStorage();

    useEffect(() => {
        supabaseClient.auth
            .signOut()
            .then(() => {
                enqueueSnackbar(
                    'To apply marketplace subscription, please login below.',
                    {
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        autoHideDuration: 10000,
                        preventDuplicate: true,
                        variant: 'info',
                    }
                );
            })
            .catch((signOutError) => {
                logRocketConsole('Marketplace:onError:failed to sign out', {
                    signOutError,
                });
            })
            .finally(() => {
                setMarketplaceVerify({
                    path: authenticatedRoutes.marketplace.verify.fullPath,
                });
                navigate(
                    `${unauthenticatedRoutes.logout.path}${location.search}`,
                    {
                        replace: true,
                    }
                );
            });
    }, [enqueueSnackbar, navigate, setMarketplaceVerify]);

    return <FullPageSpinner />;
}

export default MarketplaceCallback;
