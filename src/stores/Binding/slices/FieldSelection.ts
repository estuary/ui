import type {
    CompositeProjection,
    FieldSelectionType,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { FieldSelectionResult } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

import { getAlgorithmicFieldSelection } from 'src/utils/workflow-utils';

export type SelectionAlgorithm = 'depthOne' | 'excludeAll' | 'recommended';

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
    recommendFields: { [uuid: string]: boolean | number };
    setRecommendFields: (bindingUUID: string, value: boolean | number) => void;

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
    setAlgorithmicSelection: (
        selectedAlgorithm: SelectionAlgorithm,
        bindingUUID: string,
        value: FieldSelectionResult | undefined,
        projections: CompositeProjection[]
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

    setAlgorithmicSelection: (
        selectedAlgorithm,
        bindingUUID,
        value,
        projections
    ) => {
        if (!value) {
            return;
        }

        set(
            produce((state: BindingState) => {
                const selectedFields = [
                    value.selection.document,
                    ...value.selection.keys,
                    ...value.selection.values,
                ];

                state.selections[bindingUUID] = getAlgorithmicFieldSelection(
                    state.selections[bindingUUID],
                    projections,
                    selectedFields
                );

                if (selectedAlgorithm === 'depthOne') {
                    state.recommendFields[bindingUUID] = 1;
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

    setSingleSelection: (bindingUUID, field, mode, meta) => {
        set(
            produce((state: BindingState) => {
                const previousSelectionMode =
                    state.selections[bindingUUID][field].mode;

                state.selections[bindingUUID] = {
                    ...state.selections[bindingUUID],
                    [field]: { mode, meta },
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
