import { useZustandStore } from 'context/Zustand/provider';
import { BindingStoreNames } from 'stores/names';
import { BindingState } from './types';

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
