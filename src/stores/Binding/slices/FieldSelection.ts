import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import produce from 'immer';
import { NamedSet } from 'zustand/middleware';
import { BindingState } from '../types';

interface FieldSelection {
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

    selectionSaving: boolean;
    setSelectionSaving: (
        value: StoreWithFieldSelection['selectionSaving']
    ) => void;
}

export const getInitialFieldSelectionData = (): Pick<
    StoreWithFieldSelection,
    'recommendFields' | 'selectionSaving' | 'selections'
> => ({
    recommendFields: {},
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
                state.selections = {};

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

    setSelectionSaving: (value) => {
        set(
            produce((state: BindingState) => {
                state.selectionSaving = value;
            }),
            false,
            'Selection Saving Set'
        );
    },
});
