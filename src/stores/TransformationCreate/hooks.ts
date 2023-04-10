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
