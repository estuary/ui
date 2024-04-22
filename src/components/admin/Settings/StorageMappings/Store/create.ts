import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';
import { StorageMappingState } from './types';

const getInitialStateData = (): Pick<
    StorageMappingState,
    'formValue' | 'provider'
> => ({
    formValue: { data: {} },
    provider: '',
});

const getInitialState = (
    set: NamedSet<StorageMappingState>,
    get: StoreApi<StorageMappingState>['getState']
): StorageMappingState => ({
    ...getInitialStateData(),

    resetFormValue: () => {
        set(
            produce((state: StorageMappingState) => {
                const { formValue } = getInitialStateData();

                state.formValue = formValue;
            }),
            false,
            'Form reset'
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
        get().resetFormValue();

        set(
            produce((state: StorageMappingState) => {
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
