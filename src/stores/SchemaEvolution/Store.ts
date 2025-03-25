import type { SchemaEvolutionState } from 'stores/SchemaEvolution/types';
import type { SchemaEvolutionStoreNames } from 'stores/names';
import type { NamedSet } from 'zustand/middleware';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    SchemaEvolutionState,
    | 'addNewBindings'
    | 'autoDiscover'
    | 'evolveIncompatibleCollections'
    | 'settingsActive'
    | 'settingsSaving'
> => ({
    addNewBindings: false,
    autoDiscover: false,
    evolveIncompatibleCollections: false,
    settingsActive: false,
    settingsSaving: false,
});

const getInitialState = (
    set: NamedSet<SchemaEvolutionState>
    // get: StoreApi<SchemaEvolutionState>['getState']
): SchemaEvolutionState => ({
    ...getInitialStateData(),

    setAutoDiscover: (value, options) => {
        set(
            produce((state: SchemaEvolutionState) => {
                if (!state.settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Disable the auto-discovery options when auto-discovery itself is disabled.
                if (
                    !value &&
                    (state.addNewBindings ||
                        state.evolveIncompatibleCollections)
                ) {
                    state.addNewBindings = false;
                    state.evolveIncompatibleCollections = false;
                }

                state.autoDiscover = value;
            }),
            false,
            'Auto-Discover Set'
        );
    },

    setAddNewBindings: (value, options) => {
        set(
            produce((state: SchemaEvolutionState) => {
                if (!state.settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Enable auto-discovery when the add new bindings option is enabled.
                if (value && !state.autoDiscover) {
                    state.autoDiscover = true;
                }

                state.addNewBindings = value;
            }),
            false,
            'Add New Bindings Set'
        );
    },

    setEvolveIncompatibleCollections: (value, options) => {
        set(
            produce((state: SchemaEvolutionState) => {
                if (!state.settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Enable auto-discovery when the incompatible collection evolution option is enabled.
                if (value && !state.autoDiscover) {
                    state.autoDiscover = true;
                }

                state.evolveIncompatibleCollections = value;
            }),
            false,
            'Evolve Incompatible Collections Set'
        );
    },

    setSettingsActive: (value) => {
        set(
            produce((state: SchemaEvolutionState) => {
                state.settingsActive = value;
            }),
            false,
            'Auto-Discovery Setting Activity Status Updated'
        );
    },

    setSettingsSaving: (value) => {
        set(
            produce((state: SchemaEvolutionState) => {
                state.settingsSaving = value;
            }),
            false,
            'Auto-Discovery Setting Saving Status Updated'
        );
    },

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
            },
            false,
            'Schema Evolution State Reset'
        );
    },
});

export const createSchemaEvolutionStore = (key: SchemaEvolutionStoreNames) => {
    return create<SchemaEvolutionState>()(
        devtools((set) => getInitialState(set), devtoolsOptions(key))
    );
};
