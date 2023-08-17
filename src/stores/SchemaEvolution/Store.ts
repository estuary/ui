import produce from 'immer';
import { SchemaEvolutionState } from 'stores/SchemaEvolution/types';
import { SchemaEvolutionStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    SchemaEvolutionState,
    | 'addNewBindings'
    | 'evolveIncompatibleCollections'
    | 'settingsActive'
    | 'settingsSaving'
> => ({
    addNewBindings: false,
    evolveIncompatibleCollections: false,
    settingsActive: false,
    settingsSaving: false,
});

const getInitialState = (
    set: NamedSet<SchemaEvolutionState>,
    get: StoreApi<SchemaEvolutionState>['getState']
): SchemaEvolutionState => ({
    ...getInitialStateData(),

    setAddNewBindings: (value, options) => {
        set(
            produce((state: SchemaEvolutionState) => {
                const { evolveIncompatibleCollections, settingsActive } = get();

                if (!settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
                }

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
                const { settingsActive } = get();

                if (!settingsActive && !options?.initOnly) {
                    state.settingsActive = true;
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
