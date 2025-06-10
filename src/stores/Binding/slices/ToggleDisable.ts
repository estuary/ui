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
        value?: boolean,
        forceUpdate?: boolean
    ) => BindingDisableUpdate[];
    toggleDisable: (updates: BindingDisableUpdate[]) => void;
}

export const getStoreWithToggleDisableSettings = (
    set: NamedSet<StoreWithToggleDisable>
): StoreWithToggleDisable => ({
    toggleDisable: (updates) => {
        set(
            produce((state: BindingState) => {
                updates.forEach(({ bindingUUID, val }) => {
                    const collectionName =
                        state.resourceConfigs[bindingUUID].meta.collectionName;

                    if (val === true) {
                        state.resourceConfigs[bindingUUID].meta.disable = val;

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
                        if (
                            Object.hasOwn(
                                state.resourceConfigs[bindingUUID].meta,
                                'disable'
                            )
                        ) {
                            delete state.resourceConfigs[bindingUUID].meta
                                .disable;
                        }

                        if (
                            state.resourceConfigs[bindingUUID].meta
                                .previouslyDisabled
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

    generateToggleDisableUpdates: (targetUUIDs, value, forceUpdate = false) => {
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

                    if (forceUpdate || value !== currValue) {
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
