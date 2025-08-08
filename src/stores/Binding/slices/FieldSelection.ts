import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';

export enum HydrationStatus {
    HYDRATED = 0,
    SERVER_UPDATE_REQUESTED = 1,
    SERVER_UPDATING = 3,
    VALIDATION_REQUESTED = 4,
    VALIDATING = 5,
}

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
        hasConflicts: boolean;
        hydrating: boolean;
        status: HydrationStatus;
        value: FieldSelectionDictionary;
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
    stubSelections: (bindingUUIDs: string[]) => void;
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

const getHydrationStatus = (status?: HydrationStatus): HydrationStatus => {
    if (status === HydrationStatus.HYDRATED) {
        return HydrationStatus.SERVER_UPDATE_REQUESTED;
    }

    if (status === HydrationStatus.SERVER_UPDATE_REQUESTED) {
        return HydrationStatus.SERVER_UPDATING;
    }

    if (status === HydrationStatus.SERVER_UPDATING) {
        return HydrationStatus.VALIDATION_REQUESTED;
    }

    if (status === HydrationStatus.VALIDATION_REQUESTED) {
        return HydrationStatus.VALIDATING;
    }

    if (status === HydrationStatus.VALIDATING) {
        return HydrationStatus.HYDRATED;
    }

    return HydrationStatus.VALIDATION_REQUESTED;
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
                        state.selections[bindingUUID].status
                    );

                    state.selections[bindingUUID].hydrating =
                        evaluatedStatus !== HydrationStatus.HYDRATED;

                    state.selections[bindingUUID].status = evaluatedStatus;
                } else {
                    Object.entries(state.selections)
                        .filter(
                            ([_uuid, { status }]) => status === targetStatus
                        )
                        .forEach(([uuid, { status }]) => {
                            const evaluatedStatus = getHydrationStatus(status);

                            state.selections[uuid].hydrating =
                                evaluatedStatus !== HydrationStatus.HYDRATED;

                            state.selections[uuid].status = evaluatedStatus;
                        });
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
                    hydrating: evaluatedStatus !== HydrationStatus.HYDRATED,
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
                    hydrating: evaluatedStatus !== HydrationStatus.HYDRATED,
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
                    state.selections[bindingUUID].status
                );

                state.selections[bindingUUID] = {
                    hasConflicts,
                    hydrating: evaluatedStatus !== HydrationStatus.HYDRATED,
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
                        state.selections[bindingUUID].status
                    );

                    state.selections[bindingUUID].hydrating =
                        evaluatedStatus !== HydrationStatus.HYDRATED;

                    state.selections[bindingUUID].status = evaluatedStatus;
                }
            }),
            false,
            'Single Field Selection Set'
        );
    },

    stubSelections: (bindingUUIDs) => {
        set(
            produce((state: BindingState) => {
                bindingUUIDs.forEach((bindingUUID) => {
                    if (!state.selections?.[bindingUUID]) {
                        state.selections[bindingUUID] = {
                            hasConflicts: false,
                            hydrating: true,
                            status: getHydrationStatus(),
                            value: {},
                        };
                    }
                });
            }),
            false,
            'Selections Stubbed'
        );
    },
});
