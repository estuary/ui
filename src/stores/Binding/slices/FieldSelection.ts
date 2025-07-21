import type {
    FieldSelectionType,
    Projection,
} from 'src/components/fieldSelection/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { FieldOutcome } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

export type SelectionAlgorithm =
    | 'depthOne'
    | 'depthTwo'
    | 'excludeAll'
    | 'recommended';

export interface FieldSelection {
    mode: FieldSelectionType | null;
    outcome: FieldOutcome;
    meta?: Schema;
    projection?: Projection;
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
    recommendFields: { [uuid: string]: boolean | number };
    setRecommendFields: (bindingUUID: string, value: boolean | number) => void;

    selections: BindingFieldSelections;
    initializeSelections: (
        bindingUUID: string,
        selections: FieldSelectionDictionary
    ) => void;
    setSingleSelection: (
        bindingUUID: string,
        field: string,
        mode: FieldSelection['mode'],
        outcome: FieldOutcome,
        meta?: FieldSelection['meta']
    ) => void;
    setMultiSelection: (
        bindingUUID: string,
        updatedFields: FieldSelectionDictionary
    ) => void;
    setAlgorithmicSelection: (
        selectedAlgorithm: SelectionAlgorithm,
        bindingUUID: string,
        value: FieldSelectionDictionary | undefined
    ) => void;

    selectionSaving: boolean;
    setSelectionSaving: (
        value: StoreWithFieldSelection['selectionSaving']
    ) => void;

    selectionAlgorithm: SelectionAlgorithm | null;
    setSelectionAlgorithm: (
        value: StoreWithFieldSelection['selectionAlgorithm']
    ) => void;

    searchQuery: string | null;
    setSearchQuery: (value: StoreWithFieldSelection['searchQuery']) => void;
}

export const getInitialFieldSelectionData = (): Pick<
    StoreWithFieldSelection,
    | 'recommendFields'
    | 'searchQuery'
    | 'selectionAlgorithm'
    | 'selectionSaving'
    | 'selections'
> => ({
    recommendFields: {},
    searchQuery: null,
    selectionAlgorithm: null,
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
                state.selections[bindingUUID] = selections;
            }),
            false,
            'Selections Initialized'
        );
    },

    setAlgorithmicSelection: (selectedAlgorithm, bindingUUID, value) => {
        if (!value) {
            return;
        }

        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = value;

                switch (selectedAlgorithm) {
                    case 'depthOne': {
                        state.recommendFields[bindingUUID] = 1;
                        break;
                    }
                    case 'depthTwo': {
                        state.recommendFields[bindingUUID] = 2;
                        break;
                    }
                    case 'recommended': {
                        state.recommendFields[bindingUUID] = true;
                        break;
                    }
                }

                if (!state.selectionSaving) {
                    state.selectionSaving = true;
                }
            }),
            false,
            'Algorithmic Selections Set'
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

    setSelectionAlgorithm: (value) => {
        set(
            produce((state: BindingState) => {
                state.selectionAlgorithm = value;
            }),
            false,
            'Selection Algorithm Set'
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

    setSingleSelection: (bindingUUID, field, mode, outcome, meta) => {
        set(
            produce((state: BindingState) => {
                const previousSelectionMode =
                    state.selections[bindingUUID][field].mode;

                state.selections[bindingUUID] = {
                    ...state.selections[bindingUUID],
                    [field]: {
                        ...state.selections[bindingUUID]?.[field],
                        mode,
                        meta,
                        outcome,
                    },
                };

                if (!state.selectionSaving && previousSelectionMode !== mode) {
                    state.selectionSaving = true;
                }
            }),
            false,
            'Single Field Selection Set'
        );
    },
});
