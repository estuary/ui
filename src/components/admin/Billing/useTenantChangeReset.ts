import { useCallback, useEffect, useRef } from 'react';

import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';

export function useTenantChangeReset() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const resetBillingState = useBillingStore((state) => state.resetState);

    const resetStores = useCallback(() => {
        resetBillingState();
    }, [resetBillingState]);

    const previousTenant = useRef(selectedTenant);
    useEffect(() => {
        if (previousTenant.current !== selectedTenant) {
            previousTenant.current = selectedTenant;
            resetStores();
        }
    }, [selectedTenant, resetStores]);
}
