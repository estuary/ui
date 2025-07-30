import type { StorageMappingState } from 'src/components/admin/Settings/StorageMappings/Store/types';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { BASE_ERROR } from 'src/services/supabase';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    StorageMappingState,
    | 'dataPlaneName'
    | 'formValue'
    | 'logToken'
    | 'provider'
    | 'pubId'
    | 'saving'
    | 'serverError'
> => ({
    dataPlaneName: '',
    formValue: { data: {} },
    logToken: '',
    provider: null,
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

    setDataPlaneName: (value) => {
        set(
            produce((state: StorageMappingState) => {
                state.dataPlaneName = value;
            }),
            false,
            'Data-plane name set'
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
                    typeof value === 'string'
                        ? { ...BASE_ERROR, message: value }
                        : value;
            }),
            false,
            'Server error set'
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
