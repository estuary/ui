import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { SchemaEvolutionState } from 'stores/SchemaEvolution/types';
import { SchemaEvolutionStoreNames } from 'stores/names';
import { Entity } from 'types';

const getStoreName = (entityType: Entity): SchemaEvolutionStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
        return SchemaEvolutionStoreNames.GENERAL;
    } else {
        throw new Error('Invalid SchemaEvolution store name');
    }
};

export const useSchemaEvolution_addNewBindings = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['addNewBindings']
    >(getStoreName(entityType), (state) => state.addNewBindings);
};

export const useSchemaEvolution_setAddNewBindings = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setAddNewBindings']
    >(getStoreName(entityType), (state) => state.setAddNewBindings);
};

export const useSchemaEvolution_evolveIncompatibleCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['evolveIncompatibleCollections']
    >(getStoreName(entityType), (state) => state.evolveIncompatibleCollections);
};

export const useSchemaEvolution_setEvolveIncompatibleCollections = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setEvolveIncompatibleCollections']
    >(
        getStoreName(entityType),
        (state) => state.setEvolveIncompatibleCollections
    );
};

export const useSchemaEvolution_settingsActive = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['settingsActive']
    >(getStoreName(entityType), (state) => state.settingsActive);
};

export const useSchemaEvolution_setSettingsActive = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setSettingsActive']
    >(getStoreName(entityType), (state) => state.setSettingsActive);
};

export const useSchemaEvolution_settingsSaving = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['settingsSaving']
    >(getStoreName(entityType), (state) => state.settingsSaving);
};

export const useSchemaEvolution_setSettingsSaving = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['setSettingsSaving']
    >(getStoreName(entityType), (state) => state.setSettingsSaving);
};

export const useSchemaEvolution_resetState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        SchemaEvolutionState,
        SchemaEvolutionState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};
