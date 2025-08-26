import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { ValidationRequestMetadata } from 'src/hooks/fieldSelection/useValidateFieldSelection';
import type { BindingState } from 'src/stores/Binding/types';
import type { Schema } from 'src/types';
import type { BuiltProjection } from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

export type HydrationStatus =
    | 'HYDRATED'
    | 'SERVER_UPDATE_REQUESTED'
    | 'RESET_REQUESTED'
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
    validationFailed: boolean;
    value: FieldSelectionDictionary;
}

export interface BindingFieldSelectionDictionary {
    [uuid: string]: BindingFieldSelection;
}

export interface StoreWithFieldSelection {
    recommendFields: { [uuid: string]: boolean | number };
    setRecommendFields: (bindingUUID: string, value: boolean | number) => void;

    selections: BindingFieldSelectionDictionary;
    initializeSelections: (values: ValidationRequestMetadata[]) => void;
    setSingleSelection: (
        bindingUUID: string,
        field: string,
        mode: FieldSelection['mode'],
        outcome: FieldOutcome,
        meta?: FieldSelection['meta']
    ) => void;
    setMultiSelection: (
        bindingUUID: string,
        targetFields: string[],
        targetMode: FieldSelectionType
    ) => void;
    advanceHydrationStatus: (
        targetStatus: HydrationStatus,
        bindingUUID?: string,
        resetRequested?: boolean,
        validationRequested?: boolean
    ) => void;
    setValidationFailure: (
        bindingUUID: string,
        serverUpdateFailed?: boolean
    ) => void;

    selectionAlgorithm: SelectionAlgorithm | null;
    setSelectionAlgorithm: (
        value: StoreWithFieldSelection['selectionAlgorithm']
    ) => void;

    searchQuery: string | null;
    setSearchQuery: (value: StoreWithFieldSelection['searchQuery']) => void;
}

export const isHydrating = (status: HydrationStatus) => status !== 'HYDRATED';

export const getHydrationStatus = (
    status?: HydrationStatus,
    reset?: boolean,
    forcedStatus?: HydrationStatus
): HydrationStatus => {
    if (forcedStatus) {
        return forcedStatus;
    }

    if (status === 'HYDRATED') {
        return reset ? 'RESET_REQUESTED' : 'SERVER_UPDATE_REQUESTED';
    }

    if (status === 'SERVER_UPDATE_REQUESTED' || status === 'RESET_REQUESTED') {
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

const setBindingHydrationStatus = (
    state: BindingState,
    bindingUUID: string,
    status: HydrationStatus,
    resetRequested?: boolean,
    forcedStatus?: HydrationStatus
) => {
    const evaluatedStatus = getHydrationStatus(
        status,
        resetRequested,
        forcedStatus
    );

    state.selections[bindingUUID].hydrating = isHydrating(evaluatedStatus);
    state.selections[bindingUUID].status = evaluatedStatus;
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

    advanceHydrationStatus: (
        targetStatus,
        bindingUUID,
        resetRequested,
        validationRequested
    ) => {
        set(
            produce((state: BindingState) => {
                if (bindingUUID && state.selections?.[bindingUUID]) {
                    setBindingHydrationStatus(
                        state,
                        bindingUUID,
                        state.selections[bindingUUID].status,
                        resetRequested,
                        validationRequested ? 'VALIDATION_REQUESTED' : undefined
                    );
                } else if (!bindingUUID) {
                    Object.entries(state.selections)
                        .filter(
                            ([_uuid, { status }]) => status === targetStatus
                        )
                        .forEach(([uuid, { status }]) => {
                            setBindingHydrationStatus(
                                state,
                                uuid,
                                status,
                                resetRequested,
                                validationRequested
                                    ? 'VALIDATION_REQUESTED'
                                    : undefined
                            );
                        });
                } else {
                    // TODO: Track this error scenario.
                }
            }),
            false,
            'Hydration Status Advanced'
        );
    },

    initializeSelections: (values) => {
        set(
            produce((state: BindingState) => {
                values.forEach(
                    ({ hasConflicts, recommended, selections, uuid }) => {
                        const evaluatedStatus = getHydrationStatus(
                            state.selections[uuid].status
                        );

                        state.recommendFields[uuid] = recommended;

                        state.selections[uuid] = {
                            hasConflicts,
                            hydrating: isHydrating(evaluatedStatus),
                            status: evaluatedStatus,
                            validationFailed: false,
                            value: selections,
                        };
                    }
                );
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

    setSelectionAlgorithm: (value) => {
        set(
            produce((state: BindingState) => {
                state.selectionAlgorithm = value;
            }),
            false,
            'Selection Algorithm Set'
        );
    },

    setMultiSelection: (bindingUUID, targetFields, targetMode) => {
        set(
            produce((state: BindingState) => {
                const evaluatedStatus = getHydrationStatus(
                    state.selections[bindingUUID].status
                );

                state.selections[bindingUUID].hydrating =
                    isHydrating(evaluatedStatus);
                state.selections[bindingUUID].status = evaluatedStatus;

                Object.values(state.selections[bindingUUID].value)
                    .filter(({ field }) => targetFields.includes(field))
                    .forEach(({ field }) => {
                        state.selections[bindingUUID].value[field].mode =
                            targetMode;
                    });
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
                        isHydrating(evaluatedStatus);

                    state.selections[bindingUUID].status = evaluatedStatus;
                }
            }),
            false,
            'Single Field Selection Set'
        );
    },

    setValidationFailure: (bindingUUID, serverUpdateFailed) => {
        set(
            produce((state: BindingState) => {
                const { status } = state.selections[bindingUUID];

                state.selections[bindingUUID].validationFailed = true;

                setBindingHydrationStatus(
                    state,
                    bindingUUID,
                    status,
                    undefined,
                    serverUpdateFailed ? 'HYDRATED' : undefined
                );
            }),
            false,
            'Validation Failures Tracked'
        );
    },
});
