import { useEffect } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { authenticatedRoutes, unauthenticatedRoutes } from 'src/app/routes';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import { supabaseClient } from 'src/context/GlobalProviders';
import useMarketplaceLocalStorage from 'src/hooks/useMarketplaceLocalStorage';
import { logRocketConsole } from 'src/services/shared';

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
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const { 1: setMarketplaceVerify } = useMarketplaceLocalStorage();

    useEffect(() => {
        supabaseClient.auth
            .signOut()
            .then(() => {
                enqueueSnackbar(
                    intl.formatMessage({
                        id: 'login.marketPlace.loggedOut',
                    }),
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
    }, [enqueueSnackbar, intl, navigate, setMarketplaceVerify]);

    return <FullPageSpinner />;
}

export default MarketplaceCallback;
