import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { StorageMappingState } from './types';

const getInitialStateData = (): Pick<
    StorageMappingState,
    'formValue' | 'logToken' | 'provider' | 'pubId' | 'saving' | 'serverError'
> => ({
    formValue: { data: {} },
    logToken: '',
    provider: '',
    pubId: '',
    saving: false,
    serverError: null,
});

const getInitialState = (
    set: NamedSet<StorageMappingState>,
    _get: StoreApi<StorageMappingState>['getState']
): StorageMappingState => ({
    ...getInitialStateData(),

    resetState: () => {
        set(getInitialStateData(), false, 'State reset');
    },

    setSaving: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.saving = value;
            }),
            false,
            'Saving set'
        );
    },

    setServerError: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.serverError =
                    typeof value === 'string' ? { message: value } : value;
            }),
            false,
            'Server error set'
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
