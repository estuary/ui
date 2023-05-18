import { useLocalZustandStore } from 'context/LocalZustand';
import { TransformCreateStoreNames } from 'stores/names';
import { TransformCreateState } from './types';

export const useTransformationCreate_language = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['language']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.language);
};

export const useTransformationCreate_setLanguage = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setLanguage']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.setLanguage);
};

export const useTransformationCreate_name = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['name']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.name);
};

export const useTransformationCreate_setName = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.setName);
};

export const useTransformationCreate_prefix = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['prefix']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.prefix);
};

export const useTransformationCreate_setPrefix = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setPrefix']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.setPrefix);
};

export const useTransformationCreate_sourceCollections = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['sourceCollections']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.sourceCollections
    );
};

export const useTransformationCreate_setSourceCollections = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setSourceCollections']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setSourceCollections
    );
};

export const useTransformationCreate_transformConfigs = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['transformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.transformConfigs
    );
};

export const useTransformationCreate_addTransformConfigs = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['addTransformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.addTransformConfigs
    );
};

export const useTransformationCreate_migrations = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['migrations']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.migrations);
};

export const useTransformationCreate_addMigrations = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['addMigrations']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.addMigrations
    );
};

export const useTransformationCreate_selectedAttribute = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['selectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.selectedAttribute
    );
};

export const useTransformationCreate_setSelectedAttribute = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setSelectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setSelectedAttribute
    );
};

export const useTransformationCreate_catalogName = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['catalogName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.catalogName);
};
