import { useMemo } from 'react';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from '../useGlobalSearchParams';

function useGoogleMarketplaceParams() {
    const account_id = useGlobalSearchParams(
        GlobalSearchParams.MARKETPLACE_GCM_ACCOUNT_ID
    );
    const login_hint = useGlobalSearchParams(
        GlobalSearchParams.MARKETPLACE_GCP_LOGIN_HINT
    );

    return useMemo(
        () => ({
            account_id,
            login_hint,
        }),
        [account_id, login_hint]
    );
}

export default useGoogleMarketplaceParams;
