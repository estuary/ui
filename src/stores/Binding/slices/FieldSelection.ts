import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export type HydrationStatus =
    | 'HYDRATED'
    | 'SERVER_UPDATE_REQUESTED'
    | 'SCOPED_SERVER_UPDATE_REQUESTED'
    | 'SERVER_UPDATING'
    | 'VALIDATION_REQUESTED'
    | 'VALIDATING';

export type SelectionAlgorithm =
    | 'depthZero'
    | 'depthOne'
    | 'depthTwo'
    | 'depthUnlimited';

export interface FieldSelection {
    field: string;
    mode: FieldSelectionType | null;
    outcome: FieldOutcome;
    meta?: Schema;
    projection?: BuiltProjection;
}

export interface FieldSelectionDictionary {
    [field: string]: FieldSelection;
}

export interface BindingFieldSelection {
    hasConflicts: boolean;
    hydrating: boolean;
    status: HydrationStatus;
    value: FieldSelectionDictionary;
}

export interface BindingFieldSelectionDictionary {
    [uuid: string]: BindingFieldSelection;
}

export interface StoreWithFieldSelection {
    recommendFields: { [uuid: string]: boolean | number };
    setRecommendFields: (bindingUUID: string, value: boolean | number) => void;

    selections: BindingFieldSelectionDictionary;
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
    advanceHydrationStatus: (
        targetStatus: HydrationStatus,
        bindingUUID?: string
    ) => void;

    selectionAlgorithm: SelectionAlgorithm | null;
    setSelectionAlgorithm: (
        value: StoreWithFieldSelection['selectionAlgorithm']
    ) => void;

    searchQuery: string | null;
    setSearchQuery: (value: StoreWithFieldSelection['searchQuery']) => void;
}

const isHydrating = (status: HydrationStatus) => status !== 'HYDRATED';

const getHydrationStatus = (
    status?: HydrationStatus,
    scoped?: boolean
): HydrationStatus => {
    if (status === 'HYDRATED') {
        return scoped
            ? 'SCOPED_SERVER_UPDATE_REQUESTED'
            : 'SERVER_UPDATE_REQUESTED';
    }

    if (
        status === 'SERVER_UPDATE_REQUESTED' ||
        status === 'SCOPED_SERVER_UPDATE_REQUESTED'
    ) {
        return 'SERVER_UPDATING';
    }

    if (status === 'SERVER_UPDATING') {
        return 'VALIDATION_REQUESTED';
    }

    if (status === 'VALIDATION_REQUESTED') {
        return 'VALIDATING';
    }

    if (status === 'VALIDATING') {
        return 'HYDRATED';
    }

    return 'VALIDATION_REQUESTED';
};

export const getInitialFieldSelectionData = (): Pick<
    StoreWithFieldSelection,
    'recommendFields' | 'searchQuery' | 'selectionAlgorithm' | 'selections'
> => ({
    recommendFields: {},
    searchQuery: null,
    selectionAlgorithm: null,
    selections: {},
});

export const getStoreWithFieldSelectionSettings = (
    set: NamedSet<StoreWithFieldSelection>
): StoreWithFieldSelection => ({
    ...getInitialFieldSelectionData(),

    advanceHydrationStatus: (targetStatus, bindingUUID) => {
        set(
            produce((state: BindingState) => {
                if (bindingUUID && state.selections?.[bindingUUID]) {
                    const evaluatedStatus = getHydrationStatus(
                        state.selections[bindingUUID].status,
                        true
                    );

                    state.selections[bindingUUID].hydrating =
                        isHydrating(evaluatedStatus);

                    state.selections[bindingUUID].status = evaluatedStatus;
                } else if (!bindingUUID) {
                    Object.entries(state.selections)
                        .filter(
                            ([_uuid, { status }]) => status === targetStatus
                        )
                        .forEach(([uuid, { status }]) => {
                            const evaluatedStatus = getHydrationStatus(status);

                            state.selections[uuid].hydrating =
                                isHydrating(evaluatedStatus);

                            state.selections[uuid].status = evaluatedStatus;
                        });
                } else {
                    // TODO: Track this error scenario.
                }
            }),
            false,
            'Hydration Status Advanced'
        );
    },

    initializeSelections: (bindingUUID, selections, hasConflicts) => {
        set(
            produce((state: BindingState) => {
                const evaluatedStatus = getHydrationStatus(
                    state.selections[bindingUUID].status
                );

                state.selections[bindingUUID] = {
                    hasConflicts,
                    hydrating: isHydrating(evaluatedStatus),
                    status: evaluatedStatus,
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

                const evaluatedStatus = getHydrationStatus(
                    state.selections[bindingUUID].status
                );

                state.selections[bindingUUID] = {
                    hasConflicts,
                    hydrating: isHydrating(evaluatedStatus),
                    status: evaluatedStatus,
                    value,
                };
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

    setMultiSelection: (bindingUUID, updatedFields, hasConflicts) => {
        set(
            produce((state: BindingState) => {
                const fields = state.selections[bindingUUID].value;

                const evaluatedStatus = getHydrationStatus(
                    state.selections[bindingUUID].status,
                    true
                );

                state.selections[bindingUUID] = {
                    hasConflicts,
                    hydrating: isHydrating(evaluatedStatus),
                    status: evaluatedStatus,
                    value: {
                        ...fields,
                        ...updatedFields,
                    },
                };
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

                if (
                    !state.selections[bindingUUID].hydrating &&
                    previousSelectionMode !== mode
                ) {
                    const evaluatedStatus = getHydrationStatus(
                        state.selections[bindingUUID].status,
                        true
                    );

                    state.selections[bindingUUID].hydrating =
                        isHydrating(evaluatedStatus);

                    state.selections[bindingUUID].status = evaluatedStatus;
                }
            }),
            false,
            'Single Field Selection Set'
        );
    },
});
