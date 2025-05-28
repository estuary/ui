import type {
    BindingDisableUpdate,
    BindingState,
} from 'src/stores/Binding/types';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';
import { isBoolean } from 'lodash';

import { hasLength } from 'src/utils/misc-utils';

export interface StoreWithToggleDisable {
    generateToggleDisableUpdates: (
        targetUUIDs: string | string[] | null,
        value?: boolean
    ) => BindingDisableUpdate[];
    toggleDisable: (updates: BindingDisableUpdate[]) => void;
}

export const getStoreWithToggleDisableSettings = (
    set: NamedSet<StoreWithToggleDisable>
): StoreWithToggleDisable => ({
    toggleDisable: (updates) => {
        set(
            produce((state: BindingState) => {
                updates.forEach(({ bindingUUID: uuid, val }) => {
                    const collectionName =
                        state.resourceConfigs[uuid].meta.collectionName;

                    if (val === true) {
                        state.resourceConfigs[uuid].meta.disable = val;

                        const existingIndex =
                            state.collectionsRequiringRediscovery.findIndex(
                                (collectionRequiringRediscovery) =>
                                    collectionRequiringRediscovery ===
                                    collectionName
                            );

                        if (existingIndex > -1) {
                            state.collectionsRequiringRediscovery.splice(
                                existingIndex,
                                1
                            );

                            state.rediscoveryRequired = hasLength(
                                state.collectionsRequiringRediscovery
                            );
                        }
                    } else {
                        delete state.resourceConfigs[uuid].meta.disable;

                        if (
                            state.resourceConfigs[uuid].meta.previouslyDisabled
                        ) {
                            state.collectionsRequiringRediscovery.push(
                                collectionName
                            );

                            state.rediscoveryRequired = true;
                        }
                    }
                });
            }),
            false,
            'setDisable'
        );
    },

    generateToggleDisableUpdates: (targetUUIDs, value) => {
        const updatedBindings: BindingDisableUpdate[] = [];
        let updatedCount = 0;

        set(
            produce((state: BindingState) => {
                // Updating a single item
                // A specific list (toggle page)
                // Nothing specified (toggle all)
                const evaluatedUUIDs: string[] =
                    typeof targetUUIDs === 'string'
                        ? [targetUUIDs]
                        : Array.isArray(targetUUIDs)
                          ? targetUUIDs
                          : Object.keys(state.resourceConfigs);

                evaluatedUUIDs.forEach((uuid) => {
                    const { bindingIndex, disable } =
                        state.resourceConfigs[uuid].meta;

                    const currValue = isBoolean(disable) ? disable : false;
                    const val = value ?? !currValue;

                    if (value !== currValue) {
                        updatedCount = updatedCount + 1;
                        updatedBindings.push({
                            bindingUUID: uuid,
                            bindingIndex,
                            val,
                        });
                    }
                });
            }),
            false,
            'Binding Disable Flag Toggled'
        );

        // Return how many we updated
        return updatedBindings;
    },
});
