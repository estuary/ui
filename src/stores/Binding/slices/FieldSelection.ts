import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import produce from 'immer';
import { Schema } from 'types';
import { NamedSet } from 'zustand/middleware';
import { BindingState } from '../types';

export interface FieldSelection {
    mode: FieldSelectionType | null;
    meta?: Schema;
}

export interface ExpandedFieldSelection extends FieldSelection {
    field: string;
}

export interface FieldSelectionDictionary {
    [field: string]: FieldSelection;
}

interface BindingFieldSelections {
    [uuid: string]: FieldSelectionDictionary;
}

export interface StoreWithFieldSelection {
    recommendFields: { [uuid: string]: boolean };
    setRecommendFields: (bindingUUID: string, value: boolean) => void;

    selections: BindingFieldSelections;
    initializeSelections: (
        bindingUUID: string,
        selections: ExpandedFieldSelection[]
    ) => void;
    setSingleSelection: (
        bindingUUID: string,
        field: string,
        mode: FieldSelection['mode'],
        meta?: FieldSelection['meta']
    ) => void;
    setMultiSelection: (
        bindingUUID: string,
        updatedFields: FieldSelectionDictionary
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
    set: NamedSet<StoreWithFieldSelection>
): StoreWithFieldSelection => ({
    ...getInitialFieldSelectionData(),

    initializeSelections: (bindingUUID, selections) => {
        set(
            produce((state: BindingState) => {
                selections.forEach(({ field, mode, meta }) => {
                    state.selections[bindingUUID] = {
                        ...state.selections[bindingUUID],
                        [field]: { mode, meta },
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
        set(
            produce((state: BindingState) => {
                const fields = state.selections[bindingUUID];

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

    setSingleSelection: (bindingUUID, field, mode, meta) => {
        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = {
                    ...state.selections[bindingUUID],
                    [field]: { mode, meta },
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
