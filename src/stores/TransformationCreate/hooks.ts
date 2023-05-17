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

export const useTransformationCreate_catalogName = () => {
    return useLocalZustandStore<
        TransformCreateState,
        TransformCreateState['catalogName']
    >(TransformCreateStoreNames.TRANSFORM_CREATE, (state) => state.catalogName);
};
