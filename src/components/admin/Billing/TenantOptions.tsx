import { useCallback } from 'react';

import TenantSelector from 'src/components/shared/TenantSelector';
import { useBillingStore } from 'src/stores/Billing';

function TenantOptions() {
    const resetBillingState = useBillingStore((state) => state.resetState);

    const updateStoreState = useCallback(() => {
        resetBillingState();
    }, [resetBillingState]);

    return <TenantSelector updateStoreState={updateStoreState} />;
}

export default TenantOptions;
