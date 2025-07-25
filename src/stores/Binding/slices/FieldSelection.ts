import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export type SelectionAlgorithm =
    | 'depthZero'
    | 'depthOne'
    | 'depthTwo'
    | 'depthUnlimited';

export interface FieldSelection {
    mode: FieldSelectionType | null;
    outcome: FieldOutcome;
    meta?: Schema;
    projection?: BuiltProjection;
}

export interface ExpandedFieldSelection extends FieldSelection {
    field: string;
}

export interface FieldSelectionDictionary {
    [field: string]: FieldSelection;
}

interface BindingFieldSelections {
    [uuid: string]: {
        value: FieldSelectionDictionary;
        hasConflicts: boolean;
    };
}

export interface StoreWithFieldSelection {
    recommendFields: { [uuid: string]: boolean | number };
    setRecommendFields: (bindingUUID: string, value: boolean | number) => void;

    selections: BindingFieldSelections;
    initializeSelections: (
        bindingUUID: string,
        selections: FieldSelectionDictionary,
        hasConflicts: boolean
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
        updatedFields: FieldSelectionDictionary,
        hasConflicts: boolean
    ) => void;
    setAlgorithmicSelection: (
        selectedAlgorithm: SelectionAlgorithm,
        bindingUUID: string,
        value: FieldSelectionDictionary | undefined,
        hasConflicts: boolean
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

    initializeSelections: (bindingUUID, selections, hasConflicts) => {
        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = {
                    hasConflicts,
                    value: selections,
                };
            }),
            false,
            'Selections Initialized'
        );
    },

    setAlgorithmicSelection: (
        selectedAlgorithm,
        bindingUUID,
        value,
        hasConflicts
    ) => {
        if (!value) {
            return;
        }

        set(
            produce((state: BindingState) => {
                state.selections[bindingUUID] = { hasConflicts, value };

                switch (selectedAlgorithm) {
                    case 'depthZero': {
                        state.recommendFields[bindingUUID] = 0;
                        break;
                    }
                    case 'depthTwo': {
                        state.recommendFields[bindingUUID] = 2;
                        break;
                    }
                    case 'depthUnlimited': {
                        state.recommendFields[bindingUUID] = true;
                        break;
                    }
                    default: {
                        state.recommendFields[bindingUUID] =
                            DEFAULT_RECOMMENDED_FLAG;
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

    setMultiSelection: (bindingUUID, updatedFields, hasConflicts) => {
        set(
            produce((state: BindingState) => {
                const fields = state.selections[bindingUUID].value;

                state.selections[bindingUUID] = {
                    hasConflicts,
                    value: {
                        ...fields,
                        ...updatedFields,
                    },
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
                    state.selections[bindingUUID].value[field].mode;

                state.selections[bindingUUID].value = {
                    ...state.selections[bindingUUID].value,
                    [field]: {
                        ...state.selections[bindingUUID]?.value[field],
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
