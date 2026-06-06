import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useCallback, useEffect, useRef } from 'react';

import { useZustandStore } from 'src/context/Zustand/provider';
import { useBillingStore } from 'src/stores/Billing/Store';
import { SelectTableStoreNames } from 'src/stores/names';
import {
    useBillingTable_setHydrated,
    useBillingTable_setHydrationErrorsExist,
} from 'src/stores/Tables/Billing/hooks';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { useTenantStore } from 'src/stores/Tenant/Store';

function useTenantChangeReset() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const resetBillingState = useBillingStore((state) => state.resetState);
    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    const resetStores = useCallback(() => {
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

    const previousTenant = useRef(selectedTenant);
    useEffect(() => {
        if (previousTenant.current !== selectedTenant) {
            previousTenant.current = selectedTenant;
            resetStores();
        }
    }, [selectedTenant, resetStores]);
}

export default useTenantChangeReset;
