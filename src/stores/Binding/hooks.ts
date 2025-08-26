import type { FullSourceJsonForms } from 'src/stores/Binding/slices/TimeTravel';
import type {
    BindingState,
    CollectionMetadata,
    ResourceConfig,
} from 'src/stores/Binding/types';

import { useCallback, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { useUnmount } from 'react-use';

import {
    getCollectionNames,
    getCollections,
    getEnabledCollectionNames,
} from 'src/stores/Binding/shared';
import { useBindingStore } from 'src/stores/Binding/Store';
import { hasLength } from 'src/utils/misc-utils';

export const useBinding_hydrated = () => {
    return useBindingStore((state) => state.hydrated);
};

export const useBinding_setHydrated = () => {
    return useBindingStore((state) => state.setHydrated);
};

export const useBinding_setActive = () => {
    return useBindingStore((state) => state.setActive);
};

export const useBinding_hydrationErrorsExist = () => {
    return useBindingStore((state) => state.hydrationErrorsExist);
};

export const useBinding_setHydrationErrorsExist = () => {
    return useBindingStore((state) => state.setHydrationErrorsExist);
};

export const useBinding_hydrateState = () => {
    return useBindingStore((state) => state.hydrateState);
};

export const useBinding_prefillBindingDependentState = () => {
    return useBindingStore((state) => state.prefillBindingDependentState);
};

export const useBinding_resetState = () => {
    return useBindingStore((state) => state.resetState);
};

export const useBinding_serverUpdateRequired = () => {
    return useBindingStore((state) => state.serverUpdateRequired);
};

export const useBinding_setServerUpdateRequired = () => {
    return useBindingStore((state) => state.setServerUpdateRequired);
};

export const useBinding_resourceSchema = () => {
    return useBindingStore((state) => state.resourceSchema);
};

export const useBinding_resourceConfig = (bindingUUID: string) => {
    return useBindingStore((state) =>
        Object.hasOwn(state.resourceConfigs, bindingUUID)
            ? state.resourceConfigs[bindingUUID]
            : undefined
    );
};

export const useBinding_resourceConfigs = () => {
    return useBindingStore(useShallow((state) => state.resourceConfigs));
};

export const useBinding_prefillResourceConfigs = () => {
    return useBindingStore((state) => state.prefillResourceConfigs);
};

export const useBinding_updateResourceConfig = () => {
    return useBindingStore((state) => state.updateResourceConfig);
};

export const useBinding_resourceConfigErrorsExist = () => {
    return useBindingStore((state) => state.resourceConfigErrorsExist);
};

export const useBinding_resourceConfigErrors = () => {
    return useBindingStore((state) => state.resourceConfigErrors);
};

export const useBinding_resourceConfigOfBindingProperty = (
    bindingUUID: any,
    property: keyof ResourceConfig
) => {
    return useBindingStore(
        useShallow((state) => {
            if (!bindingUUID) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.resourceConfigs[bindingUUID]?.[property];
        })
    );
};

export const useBinding_resourceConfigOfMetaBindingProperty = <
    K extends keyof ResourceConfig['meta'],
>(
    bindingUUID: string | undefined,
    property: K
): ResourceConfig['meta'][K] | null => {
    return useBindingStore(
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
    return useBindingStore((state) => state.bindings);
};

export const useBinding_removeBinding = () => {
    return useBindingStore((state) => state.removeBinding);
};

export const useBinding_removeBindings = () => {
    return useBindingStore((state) => state.removeBindings);
};

export const useBinding_collections = () =>
    useBindingStore(
        useShallow((state) => getCollectionNames(state.resourceConfigs))
    );

export const useBinding_collectionMetadataProperty = <
    K extends keyof CollectionMetadata,
>(
    collection: string | null | undefined,
    property: K
): CollectionMetadata[K] | null => {
    return useBindingStore(
        useShallow((state) => {
            if (!collection) {
                return null;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return state.collectionMetadata[collection]?.[property];
        })
    );
};

export const useBinding_collections_count = () =>
    useBindingStore(
        useShallow((state) => getCollections(state.resourceConfigs).length)
    );

export const useBinding_enabledCollections_count = () =>
    useBindingStore(
        useShallow(
            (state) => getEnabledCollectionNames(state.resourceConfigs).length
        )
    );

export const useBinding_allBindingsDisabled = () => {
    return useBindingStore(
        useShallow((state) =>
            getCollections(state.resourceConfigs).every(
                (config) => config.meta.disable
            )
        )
    );
};

export const useBinding_enabledBindings_count = () => {
    return useBindingStore(
        useShallow((state) =>
            Object.values(state.resourceConfigs).reduce((count, config) => {
                return config.meta?.disable ? count : count + 1;
            }, 0)
        )
    );
};

export const useBinding_bindingErrorsExist = () => {
    return useBindingStore((state) => state.bindingErrorsExist);
};

export const useBinding_setCurrentBinding = () => {
    return useBindingStore((state) => state.setCurrentBinding);
};

export const useBinding_currentCollection = () => {
    return useBindingStore(
        useShallow((state) => state.currentBinding?.collection ?? null)
    );
};

export const useBinding_currentBindingUUID = () => {
    return useBindingStore(
        useShallow((state) => state.currentBinding?.uuid ?? null)
    );
};

export const useBinding_currentBindingIndex = () => {
    return useBindingStore((state) => {
        const currentBinding = state.currentBinding;

        return currentBinding
            ? state.bindings[currentBinding.collection].findIndex(
                  (uuid) => uuid === currentBinding.uuid
              )
            : -1;
    });
};

export const useBinding_evaluateDiscoveredBindings = () => {
    return useBindingStore((state) => state.evaluateDiscoveredBindings);
};

export const useBinding_removeDiscoveredBindings = () => {
    return useBindingStore((state) => state.removeDiscoveredBindings);
};

export const useBinding_discoveredCollections = () => {
    return useBindingStore((state) => state.discoveredCollections);
};

export const useBinding_setRestrictedDiscoveredCollections = () => {
    return useBindingStore((state) => state.setRestrictedDiscoveredCollections);
};

export const useBinding_rediscoveryRequired = () => {
    return useBindingStore((state) => state.rediscoveryRequired);
};

export const useBinding_resetRediscoverySettings = () => {
    return useBindingStore((state) => state.resetRediscoverySettings);
};

export const useBinding_backfilledBindings = () => {
    return useBindingStore((state) => state.backfilledBindings);
};

export const useBinding_backfilledCollections = () => {
    return useBindingStore(
        useShallow((state) =>
            state.backfilledBindings
                .filter((uuid) =>
                    Object.keys(state.resourceConfigs).includes(uuid)
                )
                .map((uuid) => state.resourceConfigs[uuid].meta.collectionName)
        )
    );
};
export const useBinding_setBackfilledBindings = () => {
    return useBindingStore((state) => state.setBackfilledBindings);
};

export const useBinding_backfillAllBindings = () => {
    return useBindingStore((state) => state.backfillAllBindings);
};

export const useBinding_recommendFields = () => {
    return useBindingStore((state) => state.recommendFields);
};

export const useBinding_setRecommendFields = () => {
    return useBindingStore((state) => state.setRecommendFields);
};

export const useBinding_selections = () => {
    return useBindingStore((state) => state.selections);
};

export const useBinding_initializeSelections = () => {
    return useBindingStore((state) => state.initializeSelections);
};

export const useBinding_setSingleSelection = () => {
    return useBindingStore((state) => state.setSingleSelection);
};

export const useBinding_setMultiSelection = () => {
    return useBindingStore((state) => state.setMultiSelection);
};

export const useBinding_searchQuery = () => {
    return useBindingStore((state) => state.searchQuery);
};

export const useBinding_setSearchQuery = () => {
    return useBindingStore((state) => state.setSearchQuery);
};

export const useBinding_selectionSaving = () => {
    return useBindingStore((state) => state.selectionSaving);
};

export const useBinding_setSelectionSaving = () => {
    return useBindingStore((state) => state.setSelectionSaving);
};

export const useBinding_fullSourceOfBinding = (bindingUUID: any) => {
    return useBindingStore((state) => {
        if (!bindingUUID) {
            return null;
        }

        return state.fullSourceConfigs[bindingUUID]?.data;
    });
};

export const useBinding_fullSourceOfBindingProperty = (
    bindingUUID: any,
    property: keyof FullSourceJsonForms
): any => {
    return useBindingStore((state) => {
        if (!bindingUUID) {
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return state.fullSourceConfigs[bindingUUID]?.[property];
    });
};

export const useBinding_fullSourceConfigs = () => {
    return useBindingStore((state) => state.fullSourceConfigs);
};

export const useBinding_removeFullSourceConfig = () => {
    return useBindingStore((state) => state.removeFullSourceConfig);
};

export const useBinding_updateFullSourceConfig = () => {
    return useBindingStore((state) => state.updateFullSourceConfig);
};

export const useBinding_fullSourceErrorsExist = () => {
    return useBindingStore((state) => state.fullSourceErrorsExist);
};

export const useBinding_evolvedCollections_count = () =>
    useBindingStore(
        useShallow((state) => {
            return state.evolvedCollections.length;
        })
    );

export const useBinding_backfilledBindings_count = () =>
    useBindingStore(
        useShallow((state) => {
            return state.backfilledBindings.length;
        })
    );

export const useBinding_backfillSupported = () =>
    useBindingStore((state) => {
        return state.backfillSupported;
    });

export const useBinding_collectionsBeingBackfilled = () =>
    useBindingStore(
        useShallow((state) => {
            return (
                state.backfilledBindings
                    // There is a chance that during rehydration that the resourceConfigs will be
                    //  empty for a little bit. This happens during materialization when a user marks
                    //  things for backfill, edits the endpoint config, and generates a new catalog.Z
                    .filter((datum) =>
                        Boolean(state.resourceConfigs?.[datum]?.meta)
                    )
                    .map(
                        (backfilledBinding) =>
                            state.resourceConfigs[backfilledBinding].meta
                                .collectionName
                    )
            );
        })
    );

export const useBinding_sourceCaptureFlags = () =>
    useBindingStore(
        useShallow((state) => ({
            sourceCaptureDeltaUpdatesSupported: hasLength(
                state.resourceConfigPointers?.x_delta_updates
            ),
            sourceCaptureTargetSchemaSupported: hasLength(
                state.resourceConfigPointers?.x_schema_name
            ),
        }))
    );

export const useBinding_setCurrentBindingWithTimeout = (
    setCurrentBinding?: BindingState['setCurrentBinding']
) => {
    const hackyTimeout = useRef<number | null>(null);
    const currentBindingUUID = useBinding_currentBindingUUID();

    useUnmount(() => {
        if (hackyTimeout.current) clearTimeout(hackyTimeout.current);
    });

    return useCallback(
        (id?: string) => {
            if (id === currentBindingUUID || !setCurrentBinding) {
                return;
            }

            // TODO (JSONForms) This is hacky but it works.
            // It clears out the current binding before switching.
            //  If a user is typing quickly in a form and then selects a
            //  different binding VERY quickly it could cause the updates
            //  to go into the wrong form.
            // Also, ...forms/renderers/Duration/AutoComplete.tsx will render wrong
            //  without this. That needs fixed for sure
            setCurrentBinding(null);

            if (typeof id === 'string') {
                hackyTimeout.current = window.setTimeout(() => {
                    setCurrentBinding(id);
                });
            }
        },
        [currentBindingUUID, setCurrentBinding]
    );
};
