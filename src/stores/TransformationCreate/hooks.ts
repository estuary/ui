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

export const useTransformationCreate_transformCount = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['transformCount']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.transformCount
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

export const useTransformationCreate_updateTransformConfigs = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['updateTransformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.updateTransformConfigs
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

export const useTransformationCreate_patchSelectedAttribute = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['patchSelectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.patchSelectedAttribute
    );
};

export const useTransformationCreate_attributeType = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['attributeType']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.attributeType
    );
};

export const useTransformationCreate_setAttributeType = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setAttributeType']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setAttributeType
    );
};

export const useTransformationCreate_previewActive = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['previewActive']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.previewActive
    );
};

export const useTransformationCreate_setPreviewActive = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setPreviewActive']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setPreviewActive
    );
};

export const useTransformationCreate_catalogUpdating = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['catalogUpdating']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.catalogUpdating
    );
};

export const useTransformationCreate_setCatalogUpdating = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setCatalogUpdating']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setCatalogUpdating
    );
};

export const useTransformationCreate_catalogName = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['catalogName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.catalogName);
};

export const useTransformationCreate_setCatalogName = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['setCatalogName']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setCatalogName
    );
};
