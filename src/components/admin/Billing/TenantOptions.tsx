import { useCallback } from 'react';

import TenantSelector from 'src/components/shared/TenantSelector';
import { useZustandStore } from 'src/context/Zustand/provider';
import { useBillingStore } from 'src/stores/Billing/Store';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    useBillingTable_setHydrated,
    useBillingTable_setHydrationErrorsExist,
} from 'src/stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'src/stores/Tables/Store';

function TenantOptions() {
    const resetBillingState = useBillingStore((state) => state.resetState);

    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    const updateStoreState = useCallback(() => {
        resetBillingState();

        resetBillingSelectTableState(false);
        setHydrated(false);
        setHydrationErrorsExist(false);
    }, [
        resetBillingSelectTableState,
        resetBillingState,
        setHydrated,
        setHydrationErrorsExist,
    ]);

    return <TenantSelector updateStoreState={updateStoreState} />;
}

export default TenantOptions;
