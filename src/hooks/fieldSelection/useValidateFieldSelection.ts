import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type {
    FieldSelectionDictionary,
    GroupKeyMetadata,
} from 'src/stores/Binding/slices/FieldSelection';
import type {
    MaterializationBinding,
    MaterializationBuiltBinding,
    MaterializationFields,
    MaterializationFields_Legacy,
    ValidatedBinding,
} from 'src/types/schemaModels';
import type {
    FieldSelectionInput_Skim,
    FieldSelectionResult,
} from 'src/types/wasm';

import { useCallback, useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { evaluate_field_selection } from '@estuary/flow-web';
import { differenceBy } from 'lodash';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import {
    useEditorStore_liveBuiltSpec,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentBindingUUID } from 'src/stores/Binding/hooks';
import { MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS } from 'src/stores/Binding/shared';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';
import { snackbarSettings } from 'src/utils/notification-utils';

interface FieldSelectionValidationResponse {
    bindingUUID: string;
    builtBinding: MaterializationBuiltBinding;
    fieldStanza:
        | MaterializationFields
        | MaterializationFields_Legacy
        | undefined;
    result: FieldSelectionResult | undefined;
}

export interface ValidationRequestMetadata {
    groupByValue: GroupKeyMetadata;
    hasConflicts: boolean;
    recommended: boolean | number;
    selections: FieldSelectionDictionary;
    uuid: string;
}

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

// Call into the flow WASM handler
const evaluateFieldSelection = async (input: FieldSelectionInput_Skim) => {
    let response: FieldSelectionResult | undefined;

    try {
        response = evaluate_field_selection(input);
        // We can catch any error here so that any issue causes an empty response and the
        //  component will show an error... though not the most useful one.
    } catch (error: unknown) {
        logRocketEvent('evaluate_field_selection', {
            failed: true,
            error,
        });
    }

    return response;
};

export default function useValidateFieldSelection() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const entityType = useEntityType();

    const currentBindingUUID = useBinding_currentBindingUUID();
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const initializeSelections = useBindingStore(
        (state) => state.initializeSelections
    );
    const resourceConfigs = useBindingStore((state) => state.resourceConfigs);
    const targetBindingContext = useBindingStore(
        useShallow((state) =>
            Object.entries(state.selections)
                .filter(
                    ([_uuid, { status }]) => status === 'VALIDATION_REQUESTED'
                )
                .map(([uuid, { validationAttempts }]) => ({
                    uuid,
                    validationAttempts,
                }))
        )
    );
    const setValidationFailure = useBindingStore(
        (state) => state.setValidationFailure
    );
    const trackValidationAttempt = useBindingStore(
        (state) => state.trackValidationAttempt
    );

    const draftSpecsRows = useEditorStore_queryResponse_draftSpecs();
    const liveBuiltSpec = useEditorStore_liveBuiltSpec();
    const collections = useWorkflowStore((state) => {
        return state.collections;
    });
    const formStatus = useFormStateStore_status();

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    const validateFieldSelection = useCallback(
        async (
            bindingUUID: string,
            draftSpecsRow: DraftSpecQuery,
            builtBindingIndex: number,
            draftedBindingIndex: number,
            validatedBindingIndex: number,
            liveBuiltBindingIndex: number
        ): Promise<FieldSelectionValidationResponse> => {
            trackValidationAttempt(bindingUUID);

            const builtBinding: MaterializationBuiltBinding | undefined =
                builtBindingIndex > -1
                    ? draftSpecsRow.built_spec?.bindings.at(builtBindingIndex)
                    : undefined;

            const draftedBinding: MaterializationBinding | undefined =
                draftedBindingIndex > -1
                    ? draftSpecsRow.spec.bindings.at(draftedBindingIndex)
                    : undefined;

            const validatedBinding: ValidatedBinding | undefined =
                validatedBindingIndex > -1
                    ? draftSpecsRow.validated?.bindings.at(
                          validatedBindingIndex
                      )
                    : undefined;

            const liveBuiltBinding: MaterializationBuiltBinding | undefined =
                liveBuiltBindingIndex > -1
                    ? liveBuiltSpec?.bindings.at(liveBuiltBindingIndex)
                    : undefined;

            if (
                !builtBinding ||
                !draftedBinding ||
                !validatedBinding ||
                !collections[builtBinding.collection.name] ||
                !collections[builtBinding.collection.name].spec
            ) {
                return Promise.reject(
                    'data not found: collection spec, built spec binding, drafted binding, or validation binding'
                );
            }

            let result: FieldSelectionResult | undefined;

            try {
                result = await evaluateFieldSelection({
                    collection: {
                        name: builtBinding.collection.name,
                        model: collections[builtBinding.collection.name].spec,
                    },
                    binding: {
                        live: liveBuiltBinding,
                        model: draftedBinding,
                        validated: validatedBinding,
                    },
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection', {
                    failed: true,
                    error,
                });
            }

            return {
                bindingUUID,
                builtBinding,
                fieldStanza: draftedBinding?.fields,
                result,
            };
        },
        [collections, liveBuiltSpec?.bindings, trackValidationAttempt]
    );

    const failureDetected = useMemo(
        () => formStatus === FormStatus.FAILED,
        [formStatus]
    );

    useEffect(() => {
        if (
            entityType !== 'materialization' ||
            targetBindingContext.length === 0
        ) {
            return;
        }

        const targetBindingUUIDs = targetBindingContext.map(({ uuid }) => uuid);

        const draftSpecsRow =
            draftSpecsRows.length !== 0 ? draftSpecsRows[0] : undefined;

        if (
            !draftSpecsRow ||
            !draftSpecsRow.built_spec ||
            !draftSpecsRow.validated
        ) {
            if (failureDetected) {
                setValidationFailure(targetBindingUUIDs, true);

                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    formFailureDetected: failureDetected,
                    missingServerData: true,
                });
            }

            return;
        }

        let pendingRequests: {
            collection: string;
            uuid: string;
            validationEligible: boolean;
        }[] = [];

        const validatedRequests: ValidationRequestMetadata[] = [];

        const validationRequests = Object.entries(resourceConfigs)
            .filter(([uuid, _config]) => targetBindingUUIDs.includes(uuid))
            .map(([uuid, { meta }]) => {
                const bindingsExists =
                    meta.builtBindingIndex > -1 &&
                    meta.validatedBindingIndex > -1;

                if (meta.disable) {
                    advanceHydrationStatus(
                        'VALIDATION_REQUESTED',
                        uuid,
                        undefined,
                        undefined,
                        true
                    );
                } else if (bindingsExists) {
                    advanceHydrationStatus('VALIDATION_REQUESTED', uuid);

                    pendingRequests.push({
                        collection: meta.collectionName,
                        uuid,
                        validationEligible: bindingsExists,
                    });

                    return validateFieldSelection(
                        uuid,
                        draftSpecsRow,
                        meta.builtBindingIndex,
                        meta.bindingIndex,
                        meta.validatedBindingIndex,
                        meta.liveBuiltBindingIndex
                    );
                } else if (failureDetected) {
                    setValidationFailure([uuid], true);

                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        formFailureDetected: failureDetected,
                        missingServerData: true,
                        targetCollection: meta.collectionName,
                    });
                }

                return null;
            })
            .filter((promise) => promise !== null);

        Promise.allSettled(validationRequests)
            .then(
                (responses) => {
                    responses.forEach((response) => {
                        if (isPromiseFulfilledResult(response)) {
                            if (!response.value || !response.value.result) {
                                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                                    validationError: true,
                                    missingResponseValue: !response.value,
                                    missingResponseResult: Boolean(
                                        response.value && !response.value.result
                                    ),
                                });

                                return;
                            }

                            const {
                                bindingUUID,
                                builtBinding,
                                fieldStanza,
                                result,
                            } = response.value;

                            const updatedSelections = getFieldSelection(
                                result.outcomes,
                                fieldStanza,
                                builtBinding?.collection.projections
                            );

                            validatedRequests.push({
                                groupByValue: {
                                    explicit: fieldStanza?.groupBy ?? [],
                                    implicit:
                                        builtBinding?.collection.key.map(
                                            (key) =>
                                                key.startsWith('/')
                                                    ? key.slice(1)
                                                    : key
                                        ) ?? [],
                                },
                                hasConflicts: result.hasConflicts,
                                recommended:
                                    fieldStanza?.recommended ??
                                    fieldsRecommended ??
                                    DEFAULT_RECOMMENDED_FLAG,
                                selections: updatedSelections,
                                uuid: bindingUUID,
                            });

                            pendingRequests = pendingRequests.filter(
                                ({ uuid }) => uuid !== bindingUUID
                            );
                        } else {
                            console.log('>>> reject response', response);
                        }
                    });
                },
                (error) => {
                    logRocketEvent(CustomEvents.FIELD_SELECTION, {
                        validationError: error,
                    });
                }
            )
            .finally(() => {
                const rejectedRequests = pendingRequests.filter(({ uuid }) =>
                    targetBindingContext.find(
                        (context) =>
                            context.uuid === uuid &&
                            context.validationAttempts ===
                                MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS
                    )
                );

                pendingRequests = differenceBy(
                    pendingRequests,
                    rejectedRequests,
                    'uuid'
                );

                if (validatedRequests.length > 0) {
                    initializeSelections(validatedRequests);
                }

                if (rejectedRequests.length > 0) {
                    rejectedRequests.forEach(
                        ({ collection, uuid, validationEligible }) => {
                            if (validationEligible) {
                                enqueueSnackbar(
                                    intl.formatMessage(
                                        {
                                            id: 'fieldSelection.error.validationFailed',
                                        },
                                        { collection }
                                    ),
                                    { ...snackbarSettings, variant: 'error' }
                                );

                                setValidationFailure([uuid]);

                                return;
                            }

                            advanceHydrationStatus('VALIDATING', uuid);
                        }
                    );
                }

                if (pendingRequests.length > 0) {
                    const retryEligibleRequests = pendingRequests.filter(
                        ({ uuid }) =>
                            targetBindingContext.find(
                                (context) =>
                                    context.uuid === uuid &&
                                    context.validationAttempts <
                                        MAX_FIELD_SELECTION_VALIDATION_ATTEMPTS
                            )
                    );

                    retryEligibleRequests.forEach(({ uuid }) => {
                        advanceHydrationStatus(
                            'VALIDATING',
                            uuid,
                            undefined,
                            true
                        );
                    });
                }
            });
    }, [
        advanceHydrationStatus,
        currentBindingUUID,
        draftSpecsRows,
        enqueueSnackbar,
        entityType,
        failureDetected,
        fieldsRecommended,
        initializeSelections,
        intl,
        resourceConfigs,
        setValidationFailure,
        targetBindingContext,
        validateFieldSelection,
    ]);
}
