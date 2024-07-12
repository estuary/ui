import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import produce from 'immer';
import { StoreApi } from 'zustand';
import { NamedSet } from 'zustand/middleware';
import { BindingState } from '../types';

export interface FieldSelection {
    [field: string]: FieldSelectionType | null;
}

export interface FieldSelectionDictionary {
    [uuid: string]: FieldSelection;
}

export interface StoreWithFieldSelection {
    recommendFields: { [uuid: string]: boolean };
    setRecommendFields: (bindingUUID: string, value: boolean) => void;

    selections: FieldSelectionDictionary;
    initializeSelections: (
        bindingUUID: string,
        selection: {
            field: string;
            selectionType: FieldSelectionType | null;
        }[]
    ) => void;
    setSingleSelection: (
        bindingUUID: string,
        field: string,
        selectionType: FieldSelectionType | null
    ) => void;
    setMultiSelection: (
        bindingUUID: string,
        updatedFields: FieldSelection
    ) => void;

    selectionSaving: boolean;
    setSelectionSaving: (
        value: StoreWithFieldSelection['selectionSaving']
    ) => void;

    searchQuery: string | null;
    setSearchQuery: (value: StoreWithFieldSelection['searchQuery']) => void;
}

export const getInitialFieldSelectionData = (): Pick<
    StoreWithFieldSelection,
    'recommendFields' | 'searchQuery' | 'selectionSaving' | 'selections'
> => ({
    recommendFields: {},
    searchQuery: null,
    selectionSaving: false,
    selections: {},
});

export const getStoreWithFieldSelectionSettings = (
    set: NamedSet<StoreWithFieldSelection>,
    get: StoreApi<StoreWithFieldSelection>['getState']
): StoreWithFieldSelection => ({
    ...getInitialFieldSelectionData(),

    initializeSelections: (bindingUUID, selections) => {
        set(
            produce((state: BindingState) => {
                selections.forEach(({ field, selectionType }) => {
                    state.selections[bindingUUID] = {
                        ...state.selections[bindingUUID],
                        [field]: selectionType,
                    };
                });
            }),
            false,
            'Selections Initialized'
        );
    },

    setRecommendFields: (bindingUUID, value) => {
        set(
            produce((state: BindingState) => {
                state.recommendFields[bindingUUID] = value;
            }),
            false,
            'Recommend Fields Flag Set'
        );
    },

    setSearchQuery: (value) => {
        set(
            produce((state: BindingState) => {
                state.searchQuery = value;
            }),
            false,
            'Search Query Set'
        );
    },

    setSelectionSaving: (value) => {
        set(
            produce((state: BindingState) => {
                state.selectionSaving = value;
            }),
            false,
            'Selection Saving Set'
        );
    },

    setMultiSelection: (bindingUUID, updatedFields) => {
        const { selections } = get();

        const fields = selections[bindingUUID];

        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = {
                    ...fields,
                    ...updatedFields,
                };

                if (!state.selectionSaving) {
                    state.selectionSaving = true;
                }
            }),
            false,
            'Multiple Field Selections Set'
        );
    },

    setSingleSelection: (bindingUUID, field, selectionType) => {
        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = {
                    ...state.selections[bindingUUID],
                    [field]: selectionType,
                };

                if (!state.selectionSaving) {
                    state.selectionSaving = true;
                }
            }),
            false,
            'Single Field Selection Set'
        );
    },
});
