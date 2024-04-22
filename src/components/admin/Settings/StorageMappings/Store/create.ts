import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { StorageMappingState } from './types';

const getInitialConfigurationData = (): Pick<
    StorageMappingState,
    'formValue' | 'provider'
> => ({
    formValue: { data: {} },
    provider: '',
});

const getInitialPublicationData = (): Pick<
    StorageMappingState,
    'logToken' | 'pubId'
> => ({
    logToken: '',
    pubId: '',
});

const getInitialStateData = () => ({
    ...getInitialConfigurationData(),
    ...getInitialPublicationData(),
});

const getInitialState = (
    set: NamedSet<StorageMappingState>,
    _get: StoreApi<StorageMappingState>['getState']
): StorageMappingState => ({
    ...getInitialStateData(),

    resetForm: () => {
        set(
            produce((state: StorageMappingState) => {
                const initState = getInitialConfigurationData();

                return { ...state, ...initState };
            }),
            false,
            'Form reset'
        );
    },

    resetPublication: () => {
        set(
            produce((state: StorageMappingState) => {
                const initState = getInitialPublicationData();

                return { ...state, ...initState };
            }),
            false,
            'Publication-related state reset'
        );
    },

    setLogToken: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.logToken = value;
            }),
            false,
            'Publication log token set'
        );
    },

    setPubId: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.pubId = value;
            }),
            false,
            'Publication ID set'
        );
    },

    updateFormValue: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.formValue = value;
            }),
            false,
            'Form updated'
        );
    },

    updateProvider: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.formValue = { data: {} };
                state.provider = value;
            }),
            false,
            'Cloud provider updated'
        );
    },
});

export const useStorageMappingStore = create<StorageMappingState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('storage-mappings')
    )
);
