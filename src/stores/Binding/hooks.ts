import { useZustandStore } from 'context/Zustand/provider';
import { BindingStoreNames } from 'stores/names';
import { shallow } from 'zustand/shallow';
import { BindingState, ResourceConfig } from './types';

export const useBinding_hydrated = () => {
    return useZustandStore<BindingState, BindingState['hydrated']>(
        BindingStoreNames.GENERAL,
        (state) => state.hydrated
    );
};

export const useBinding_setHydrated = () => {
    return useZustandStore<BindingState, BindingState['setHydrated']>(
        BindingStoreNames.GENERAL,
        (state) => state.setHydrated
    );
};

export const useBinding_setActive = () => {
    return useZustandStore<BindingState, BindingState['setActive']>(
        BindingStoreNames.GENERAL,
        (state) => state.setActive
    );
};

export const useBinding_hydrationErrorsExist = () => {
    return useZustandStore<BindingState, BindingState['hydrationErrorsExist']>(
        BindingStoreNames.GENERAL,
        (state) => state.hydrationErrorsExist
    );
};

export const useBinding_setHydrationErrorsExist = () => {
    return useZustandStore<
        BindingState,
        BindingState['setHydrationErrorsExist']
    >(BindingStoreNames.GENERAL, (state) => state.setHydrationErrorsExist);
};

export const useBinding_hydrateState = () => {
    return useZustandStore<BindingState, BindingState['hydrateState']>(
        BindingStoreNames.GENERAL,
        (state) => state.hydrateState
    );
};

export const useBinding_resetState = () => {
    return useZustandStore<BindingState, BindingState['resetState']>(
        BindingStoreNames.GENERAL,
        (state) => state.resetState
    );
};

export const useBinding_resourceSchema = () => {
    return useZustandStore<BindingState, BindingState['resourceSchema']>(
        BindingStoreNames.GENERAL,
        (state) => state.resourceSchema
    );
};

export const useBinding_setResourceSchema = () => {
    return useZustandStore<BindingState, BindingState['setResourceSchema']>(
        BindingStoreNames.GENERAL,
        (state) => state.setResourceSchema
    );
};

export const useBinding_resourceConfigs = () => {
    return useZustandStore<BindingState, BindingState['resourceConfigs']>(
        BindingStoreNames.GENERAL,
        (state) => state.resourceConfigs,
        shallow
    );
};

export const useBinding_updateResourceConfig = () => {
    return useZustandStore<BindingState, BindingState['updateResourceConfig']>(
        BindingStoreNames.GENERAL,
        (state) => state.updateResourceConfig
    );
};

export const useBinding_resourceConfigOfCollectionProperty = (
    bindingUUID: any,
    property: keyof ResourceConfig
) => {
    return useZustandStore<BindingState, any>(
        BindingStoreNames.GENERAL,
        (state) => {
            if (!bindingUUID) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.[property];
        },
        shallow
    );
};

export const useBinding_resourceConfigOfMetaCollectionProperty = (
    bindingUUID: any,
    property: keyof ResourceConfig['meta']
) => {
    return useZustandStore<BindingState, any>(
        BindingStoreNames.GENERAL,
        (state) => {
            if (!bindingUUID) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.meta?.[property];
        },
        shallow
    );
};

export const useBinding_bindings = () => {
    return useZustandStore<BindingState, BindingState['bindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.bindings
    );
};

export const useBinding_collections = () => {
    return useZustandStore<BindingState, string[]>(
        BindingStoreNames.GENERAL,
        (state) => state.getCollections(),
        shallow
    );
};

export const useBinding_currentBinding = () => {
    return useZustandStore<BindingState, BindingState['currentBinding']>(
        BindingStoreNames.GENERAL,
        (state) => state.currentBinding
    );
};

export const useBinding_setCurrentBinding = () => {
    return useZustandStore<BindingState, BindingState['setCurrentBinding']>(
        BindingStoreNames.GENERAL,
        (state) => state.setCurrentBinding
    );
};

export const useBinding_currentCollection = () => {
    return useZustandStore<BindingState, string | null>(
        BindingStoreNames.GENERAL,
        (state) => state.currentBinding?.collection ?? null
    );
};

export const useBinding_currentBindingId = () => {
    return useZustandStore<BindingState, string | null>(
        BindingStoreNames.GENERAL,
        (state) => state.currentBinding?.id ?? null
    );
};
