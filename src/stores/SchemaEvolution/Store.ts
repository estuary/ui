import produce from 'immer';
import { SchemaEvolutionState } from 'stores/SchemaEvolution/types';
import { SchemaEvolutionStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

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
    set: NamedSet<SchemaEvolutionState>,
    get: StoreApi<SchemaEvolutionState>['getState']
): SchemaEvolutionState => ({
    ...getInitialStateData(),

    setAutoDiscover: (value, options) => {
        set(
            produce((state: SchemaEvolutionState) => {
                const {
                    addNewBindings,
                    evolveIncompatibleCollections,
                    settingsActive,
                } = get();

                if (!settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Disable the auto-discovery options when auto-discovery itself is disabled.
                if (
                    !value &&
                    (addNewBindings || evolveIncompatibleCollections)
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
                const {
                    autoDiscover,
                    evolveIncompatibleCollections,
                    settingsActive,
                } = get();

                if (!settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Enable auto-discovery when the add new bindings option is enabled.
                if (value && !autoDiscover) {
                    state.autoDiscover = true;
                }

                // Disable the incompatible collection evolution option when the add new bindings option is disabled.
                if (!value && evolveIncompatibleCollections) {
                    state.evolveIncompatibleCollections = false;
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
                const { addNewBindings, autoDiscover, settingsActive } = get();

                if (!settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

                // Enable auto-discovery and the add new bindings option when the incompatible collection evolution option is enabled.
                if (value && (!autoDiscover || !addNewBindings)) {
                    state.autoDiscover = true;
                    state.addNewBindings = true;
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
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
