import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from 'utils/localStorage-utils';

function useMarketplaceLocalStorage() {
    return useLocalStorage<{ path: string | null }>(
        LocalStorageKeys.MARKETPLACE_VERIFY
    );
}

export default useMarketplaceLocalStorage;
