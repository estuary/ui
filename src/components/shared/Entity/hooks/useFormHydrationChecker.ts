import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useMemo } from 'react';
import { useBinding_hydrated } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfig_hydrated } from 'src/stores/EndpointConfig/hooks';

export const useFormHydrationChecker = () => {
    // For edit we need to make sure resource is there.
    // For create we do not care otherwise this will return false when changing connectors
    const includeResourceConfig = useEntityWorkflow_Editing();

    const detailsFormStoreHydrated = useDetailsFormStore(
        (state) => state.hydrated
    );
    const endpointConfigStoreHydrated = useEndpointConfig_hydrated();
    const bindingsHydrated = useBinding_hydrated();

    const storeHydrationComplete = useMemo(() => {
        return includeResourceConfig
            ? detailsFormStoreHydrated &&
                  endpointConfigStoreHydrated &&
                  bindingsHydrated
            : detailsFormStoreHydrated && endpointConfigStoreHydrated;
    }, [
        bindingsHydrated,
        detailsFormStoreHydrated,
        endpointConfigStoreHydrated,
        includeResourceConfig,
    ]);

    return storeHydrationComplete;
};
