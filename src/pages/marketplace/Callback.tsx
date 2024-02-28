import GoogleMarketplaceCallback from 'components/marketplace/google/Callback';
import { useClient } from 'hooks/supabase-swr';
import { useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { useSnackbar } from 'notistack';
import { logRocketConsole } from 'services/shared';

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
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    useMount(() => {
        supabaseClient.auth
            .signOut()
            .then(() => {
                enqueueSnackbar(
                    intl.formatMessage({
                        id: 'marketPlace.loggedOut',
                    }),
                    {
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        autoHideDuration: 10000,
                        variant: 'info',
                    }
                );
            })
            .catch((signOutError) => {
                logRocketConsole('Marketplace:onError:failed to sign out', {
                    signOutError,
                });
            });
    });

    return <GoogleMarketplaceCallback />;
}

export default MarketplaceCallback;
