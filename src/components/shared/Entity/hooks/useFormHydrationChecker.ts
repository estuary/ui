import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useMemo } from 'react';
import { useDetailsForm_hydrated } from 'stores/DetailsForm/hooks';
import { useEndpointConfig_hydrated } from 'stores/EndpointConfig/hooks';
import { useResourceConfig_hydrated } from 'stores/ResourceConfig/hooks';

export const useFormHydrationChecker = () => {
    // For edit we need to make sure resource is there.
    // For create we do not care otherwise this will return false when changing connectors
    const includeResourceConfig = useEntityWorkflow_Editing();

    const detailsFormStoreHydrated = useDetailsForm_hydrated();
    const endpointConfigStoreHydrated = useEndpointConfig_hydrated();
    const resourceConfigStoreHydrated = useResourceConfig_hydrated();

    const storeHydrationComplete = useMemo(() => {
        return includeResourceConfig
            ? detailsFormStoreHydrated &&
                  endpointConfigStoreHydrated &&
                  resourceConfigStoreHydrated
            : detailsFormStoreHydrated && endpointConfigStoreHydrated;
    }, [
        detailsFormStoreHydrated,
        endpointConfigStoreHydrated,
        includeResourceConfig,
        resourceConfigStoreHydrated,
    ]);

    return storeHydrationComplete;
};
