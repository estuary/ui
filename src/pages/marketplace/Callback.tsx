import { useClient } from 'hooks/supabase-swr';
import { useIntl } from 'react-intl';
import { useSnackbar } from 'notistack';
import { logRocketConsole } from 'services/shared';
import { getPathWithParams } from 'utils/misc-utils';
import { unauthenticatedRoutes } from 'app/routes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useNavigate } from 'react-router-dom';
import { SupportedProvider } from 'types/authProviders';
import FullPageSpinner from 'components/fullPage/Spinner';
import { useEffect } from 'react';
import useMarketplaceLocalStorage from 'hooks/useMarketplaceLocalStorage';

// Expanding Marketplace Providers
// Once we add more providers the idea is to do something like this
// const provider = useGlobalSearchParams<MarketPlaceProviders>(
//     GlobalSearchParams.PROVIDER
// );
// if (provider === 'google') {
//     return <GoogleMarketplaceCallback />;
// }

function MarketplaceCallback() {
    const supabaseClient = useClient();
    const navigate = useNavigate();
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const provider = useGlobalSearchParams<SupportedProvider>(
        GlobalSearchParams.PROVIDER
    );

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
                setMarketplaceVerify({ search: location.search });
                navigate(
                    getPathWithParams(unauthenticatedRoutes.logout.path, {
                        [GlobalSearchParams.PROVIDER]: provider,
                    }),
                    {
                        replace: true,
                    }
                );
            });
    }, [
        enqueueSnackbar,
        intl,
        navigate,
        provider,
        setMarketplaceVerify,
        supabaseClient.auth,
    ]);

    return <FullPageSpinner />;
}

export default MarketplaceCallback;
