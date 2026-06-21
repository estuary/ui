import { useCallback, useEffect, useRef } from 'react';

import { useBillingStore } from 'src/stores/Billing';
import { useTenantStore } from 'src/stores/Tenant';

// Reset billing state whenever the selected tenant changes. The tenant selector
// itself now lives in the global org menu, so this page only needs the side
// effect of clearing stale billing data when the active tenant switches.
function useTenantChangeReset() {
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

export default useTenantChangeReset;
