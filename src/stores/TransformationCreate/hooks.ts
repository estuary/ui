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
