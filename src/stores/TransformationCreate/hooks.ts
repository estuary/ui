import { useZustandStore } from 'context/Zustand/provider';
import { TransformCreateStoreNames } from 'stores/names';
import { TransformCreateState } from './types';

export const useTransformationCreate_language = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['language']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.language);
};

export const useTransformationCreate_setLanguage = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setLanguage']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.setLanguage);
};

export const useTransformationCreate_name = () => {
    return useZustandStore<TransformCreateState, TransformCreateState['name']>(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.name
    );
};

export const useTransformationCreate_setName = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.setName);
};

export const useTransformationCreate_sourceCollections = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['sourceCollections']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.sourceCollections
    );
};

export const useTransformationCreate_setSourceCollections = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setSourceCollections']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setSourceCollections
    );
};

export const useTransformationCreate_transformCount = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['transformCount']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.transformCount
    );
};

export const useTransformationCreate_transformConfigs = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['transformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.transformConfigs
    );
};

export const useTransformationCreate_addTransformConfigs = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['addTransformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.addTransformConfigs
    );
};

export const useTransformationCreate_updateTransformConfigs = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['updateTransformConfigs']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.updateTransformConfigs
    );
};

export const useTransformationCreate_migrations = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['migrations']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.migrations);
};

export const useTransformationCreate_addMigrations = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['addMigrations']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.addMigrations
    );
};

export const useTransformationCreate_shuffleKeyErrorsExist = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['shuffleKeyErrorsExist']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.shuffleKeyErrorsExist
    );
};

export const useTransformationCreate_selectedAttribute = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['selectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.selectedAttribute
    );
};

export const useTransformationCreate_setSelectedAttribute = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setSelectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setSelectedAttribute
    );
};

export const useTransformationCreate_patchSelectedAttribute = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['patchSelectedAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.patchSelectedAttribute
    );
};

export const useTransformationCreate_removeAttribute = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['removeAttribute']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.removeAttribute
    );
};

export const useTransformationCreate_attributeType = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['attributeType']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.attributeType
    );
};

export const useTransformationCreate_setAttributeType = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setAttributeType']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setAttributeType
    );
};

export const useTransformationCreate_emptySQLExists = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['emptySQLExists']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.emptySQLExists
    );
};

export const useTransformationCreate_previewActive = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['previewActive']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.previewActive
    );
};

export const useTransformationCreate_setPreviewActive = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setPreviewActive']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setPreviewActive
    );
};

export const useTransformationCreate_catalogUpdating = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['catalogUpdating']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.catalogUpdating
    );
};

export const useTransformationCreate_setCatalogUpdating = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setCatalogUpdating']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setCatalogUpdating
    );
};

export const useTransformationCreate_catalogName = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['catalogName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.catalogName);
};

export const useTransformationCreate_setCatalogName = () => {
    return useZustandStore<
        TransformCreateState,
        TransformCreateState['setCatalogName']
    >(
        TransformCreateStoreNames.TRANSFORM_CREATE,
        (state) => state.setCatalogName
    );
};
