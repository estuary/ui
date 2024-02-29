import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';

function useMarketplaceLocalStorage() {
    return useLocalStorage<{ search: string | null }>(
        LocalStorageKeys.MARKETPLACE_VERIFY
    );
}

export default useMarketplaceLocalStorage;
