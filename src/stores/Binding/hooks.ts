import { useZustandStore } from 'context/Zustand/provider';
import { BindingStoreNames } from 'stores/names';
import { useShallow } from 'zustand/react/shallow';
import { FullSource, FullSourceDictionary } from './slices/TimeTravel';
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

export const useBinding_prefillBindingDependentState = () => {
    return useZustandStore<
        BindingState,
        BindingState['prefillBindingDependentState']
    >(BindingStoreNames.GENERAL, (state) => state.prefillBindingDependentState);
};

export const useBinding_resetState = () => {
    return useZustandStore<BindingState, BindingState['resetState']>(
        BindingStoreNames.GENERAL,
        (state) => state.resetState
    );
};

export const useBinding_serverUpdateRequired = () => {
    return useZustandStore<BindingState, BindingState['serverUpdateRequired']>(
        BindingStoreNames.GENERAL,
        (state) => state.serverUpdateRequired
    );
};

export const useBinding_setServerUpdateRequired = () => {
    return useZustandStore<
        BindingState,
        BindingState['setServerUpdateRequired']
    >(BindingStoreNames.GENERAL, (state) => state.setServerUpdateRequired);
};

export const useBinding_resourceSchema = () => {
    return useZustandStore<BindingState, BindingState['resourceSchema']>(
        BindingStoreNames.GENERAL,
        (state) => state.resourceSchema
    );
};

export const useBinding_resourceConfig = (bindingUUID: string) => {
    return useZustandStore<BindingState, ResourceConfig | undefined>(
        BindingStoreNames.GENERAL,
        (state) =>
            Object.hasOwn(state.resourceConfigs, bindingUUID)
                ? state.resourceConfigs[bindingUUID]
                : undefined
    );
};

export const useBinding_resourceConfigs = () => {
    return useZustandStore<BindingState, BindingState['resourceConfigs']>(
        BindingStoreNames.GENERAL,
        useShallow((state) => state.resourceConfigs)
    );
};

export const useBinding_prefillResourceConfigs = () => {
    return useZustandStore<
        BindingState,
        BindingState['prefillResourceConfigs']
    >(BindingStoreNames.GENERAL, (state) => state.prefillResourceConfigs);
};

export const useBinding_updateResourceConfig = () => {
    return useZustandStore<BindingState, BindingState['updateResourceConfig']>(
        BindingStoreNames.GENERAL,
        (state) => state.updateResourceConfig
    );
};

export const useBinding_resourceConfigErrorsExist = () => {
    return useZustandStore<
        BindingState,
        BindingState['resourceConfigErrorsExist']
    >(BindingStoreNames.GENERAL, (state) => state.resourceConfigErrorsExist);
};

export const useBinding_resourceConfigErrors = () => {
    return useZustandStore<BindingState, BindingState['resourceConfigErrors']>(
        BindingStoreNames.GENERAL,
        (state) => state.resourceConfigErrors
    );
};

export const useBinding_resourceConfigOfBindingProperty = (
    bindingUUID: any,
    property: keyof ResourceConfig
) => {
    return useZustandStore<BindingState, any>(
        BindingStoreNames.GENERAL,
        useShallow((state) => {
            if (!bindingUUID) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.[property];
        })
    );
};

export const useBinding_resourceConfigOfMetaBindingProperty = (
    bindingUUID: any,
    property: keyof ResourceConfig['meta']
) => {
    return useZustandStore<BindingState, any>(
        BindingStoreNames.GENERAL,
        useShallow((state) => {
            if (!bindingUUID) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.meta?.[property];
        })
    );
};

export const useBinding_bindings = () => {
    return useZustandStore<BindingState, BindingState['bindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.bindings
    );
};

export const useBinding_removeBinding = () => {
    return useZustandStore<BindingState, BindingState['removeBinding']>(
        BindingStoreNames.GENERAL,
        (state) => state.removeBinding
    );
};

export const useBinding_removeBindings = () => {
    return useZustandStore<BindingState, BindingState['removeBindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.removeBindings
    );
};

export const useBinding_collections = () => {
    return useZustandStore<BindingState, string[]>(
        BindingStoreNames.GENERAL,
        useShallow((state) => state.getCollections())
    );
};

export const useBinding_toggleDisable = () => {
    return useZustandStore<BindingState, BindingState['toggleDisable']>(
        BindingStoreNames.GENERAL,
        (state) => state.toggleDisable
    );
};

export const useBinding_allBindingsDisabled = () => {
    return useZustandStore<BindingState, boolean>(
        BindingStoreNames.GENERAL,
        useShallow((state) =>
            Object.values(state.resourceConfigs).every(
                (config) => config.meta.disable
            )
        )
    );
};

export const useBinding_someBindingsDisabled = () => {
    return useZustandStore<BindingState, boolean>(
        BindingStoreNames.GENERAL,
        useShallow((state) =>
            Object.values(state.resourceConfigs).some(
                (config) => config.meta.disable
            )
        )
    );
};

export const useBinding_bindingErrorsExist = () => {
    return useZustandStore<BindingState, BindingState['bindingErrorsExist']>(
        BindingStoreNames.GENERAL,
        (state) => state.bindingErrorsExist
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
        useShallow((state) => state.currentBinding?.collection ?? null)
    );
};

export const useBinding_currentBindingUUID = () => {
    return useZustandStore<BindingState, string | null>(
        BindingStoreNames.GENERAL,
        useShallow((state) => state.currentBinding?.uuid ?? null)
    );
};

export const useBinding_currentBindingIndex = () => {
    return useZustandStore<BindingState, number>(
        BindingStoreNames.GENERAL,
        (state) => {
            const currentBinding = state.currentBinding;

            return currentBinding
                ? state.bindings[currentBinding.collection].findIndex(
                      (uuid) => uuid === currentBinding.uuid
                  )
                : -1;
        }
    );
};

export const useBinding_evaluateDiscoveredBindings = () => {
    return useZustandStore<
        BindingState,
        BindingState['evaluateDiscoveredBindings']
    >(BindingStoreNames.GENERAL, (state) => state.evaluateDiscoveredBindings);
};

export const useBinding_removeDiscoveredBindings = () => {
    return useZustandStore<
        BindingState,
        BindingState['removeDiscoveredBindings']
    >(BindingStoreNames.GENERAL, (state) => state.removeDiscoveredBindings);
};

export const useBinding_discoveredCollections = () => {
    return useZustandStore<BindingState, BindingState['discoveredCollections']>(
        BindingStoreNames.GENERAL,
        (state) => state.discoveredCollections
    );
};

export const useBinding_setRestrictedDiscoveredCollections = () => {
    return useZustandStore<
        BindingState,
        BindingState['setRestrictedDiscoveredCollections']
    >(
        BindingStoreNames.GENERAL,
        (state) => state.setRestrictedDiscoveredCollections
    );
};

export const useBinding_rediscoveryRequired = () => {
    return useZustandStore<BindingState, BindingState['rediscoveryRequired']>(
        BindingStoreNames.GENERAL,
        (state) => state.rediscoveryRequired
    );
};

export const useBinding_resetRediscoverySettings = () => {
    return useZustandStore<
        BindingState,
        BindingState['resetRediscoverySettings']
    >(BindingStoreNames.GENERAL, (state) => state.resetRediscoverySettings);
};

export const useBinding_backfilledBindings = () => {
    return useZustandStore<BindingState, BindingState['backfilledBindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.backfilledBindings
    );
};

export const useBinding_setBackfilledBindings = () => {
    return useZustandStore<BindingState, BindingState['setBackfilledBindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.setBackfilledBindings
    );
};

export const useBinding_backfillAllBindings = () => {
    return useZustandStore<BindingState, BindingState['backfillAllBindings']>(
        BindingStoreNames.GENERAL,
        (state) => state.backfillAllBindings
    );
};

export const useBinding_recommendFields = () => {
    return useZustandStore<BindingState, BindingState['recommendFields']>(
        BindingStoreNames.GENERAL,
        (state) => state.recommendFields
    );
};

export const useBinding_setRecommendFields = () => {
    return useZustandStore<BindingState, BindingState['setRecommendFields']>(
        BindingStoreNames.GENERAL,
        (state) => state.setRecommendFields
    );
};

export const useBinding_selections = () => {
    return useZustandStore<BindingState, BindingState['selections']>(
        BindingStoreNames.GENERAL,
        (state) => state.selections
    );
};

export const useBinding_initializeSelections = () => {
    return useZustandStore<BindingState, BindingState['initializeSelections']>(
        BindingStoreNames.GENERAL,
        (state) => state.initializeSelections
    );
};

export const useBinding_setSingleSelection = () => {
    return useZustandStore<BindingState, BindingState['setSingleSelection']>(
        BindingStoreNames.GENERAL,
        (state) => state.setSingleSelection
    );
};

export const useBinding_selectionSaving = () => {
    return useZustandStore<BindingState, BindingState['selectionSaving']>(
        BindingStoreNames.GENERAL,
        (state) => state.selectionSaving
    );
};

export const useBinding_setSelectionSaving = () => {
    return useZustandStore<BindingState, BindingState['setSelectionSaving']>(
        BindingStoreNames.GENERAL,
        (state) => state.setSelectionSaving
    );
};

export const useBinding_fullSourceOfBinding = (bindingUUID: any) => {
    return useZustandStore<BindingState, FullSource | undefined | null>(
        BindingStoreNames.GENERAL,
        (state) => {
            if (!bindingUUID) {
                return null;
            }

            return state.fullSourceConfigs[bindingUUID]?.data;
        }
    );
};

export const useBinding_fullSourceOfBindingProperty = (
    bindingUUID: any,
    property: keyof FullSourceDictionary
) => {
    return useZustandStore<BindingState, any>(
        BindingStoreNames.GENERAL,
        (state) => {
            if (!bindingUUID) {
                return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.fullSourceConfigs[bindingUUID]?.[property];
        }
    );
};

export const useBinding_fullSourceConfigs = () => {
    return useZustandStore<BindingState, BindingState['fullSourceConfigs']>(
        BindingStoreNames.GENERAL,
        (state) => state.fullSourceConfigs
    );
};

export const useBinding_removeFullSourceConfig = () => {
    return useZustandStore<
        BindingState,
        BindingState['removeFullSourceConfig']
    >(BindingStoreNames.GENERAL, (state) => state.removeFullSourceConfig);
};

export const useBinding_updateFullSourceConfig = () => {
    return useZustandStore<
        BindingState,
        BindingState['updateFullSourceConfig']
    >(BindingStoreNames.GENERAL, (state) => state.updateFullSourceConfig);
};

export const useBinding_fullSourceErrorsExist = () => {
    return useZustandStore<BindingState, BindingState['fullSourceErrorsExist']>(
        BindingStoreNames.GENERAL,
        (state) => state.fullSourceErrorsExist
    );
};
