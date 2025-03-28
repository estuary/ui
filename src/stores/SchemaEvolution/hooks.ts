import { useZustandStore } from 'src/context/Zustand/provider';
import { SchemaEvolutionStoreNames } from 'src/stores/names';
import type { SchemaEvolutionState } from 'src/stores/SchemaEvolution/types';

export const useSchemaEvolution_autoDiscover = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['autoDiscover']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.autoDiscover);
};

export const useSchemaEvolution_setAutoDiscover = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setAutoDiscover']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.setAutoDiscover);
};

export const useSchemaEvolution_addNewBindings = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['addNewBindings']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.addNewBindings);
};

export const useSchemaEvolution_setAddNewBindings = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setAddNewBindings']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.setAddNewBindings);
};

export const useSchemaEvolution_evolveIncompatibleCollections = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['evolveIncompatibleCollections']
    >(
        SchemaEvolutionStoreNames.GENERAL,
        (state) => state.evolveIncompatibleCollections
    );
};

export const useSchemaEvolution_setEvolveIncompatibleCollections = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setEvolveIncompatibleCollections']
    >(
        SchemaEvolutionStoreNames.GENERAL,
        (state) => state.setEvolveIncompatibleCollections
    );
};

export const useSchemaEvolution_settingsActive = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['settingsActive']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.settingsActive);
};

export const useSchemaEvolution_setSettingsActive = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setSettingsActive']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.setSettingsActive);
};

export const useSchemaEvolution_settingsSaving = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['settingsSaving']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.settingsSaving);
};

export const useSchemaEvolution_setSettingsSaving = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setSettingsSaving']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.setSettingsSaving);
};

export const useSchemaEvolution_resetState = () => {
    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['resetState']
    >(SchemaEvolutionStoreNames.GENERAL, (state) => state.resetState);
};
