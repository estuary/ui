import TenantSelector from 'components/shared/TenantSelector';
import { useZustandStore } from 'context/Zustand/provider';
import { useCallback } from 'react';
import { useBilling_resetState } from 'stores/Billing/hooks';
import { SelectTableStoreNames } from 'stores/names';
import {
    useBillingTable_setHydrated,
    useBillingTable_setHydrationErrorsExist,
} from 'stores/Tables/Billing/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';

function TenantOptions() {
    const resetBillingState = useBilling_resetState();

    const setHydrated = useBillingTable_setHydrated();
    const setHydrationErrorsExist = useBillingTable_setHydrationErrorsExist();

    const resetBillingSelectTableState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(SelectTableStoreNames.BILLING, selectableTableStoreSelectors.state.reset);

    const updateStoreState = useCallback(() => {
        resetBillingState();

        resetBillingSelectTableState();
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
