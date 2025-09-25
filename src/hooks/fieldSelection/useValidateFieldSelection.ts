import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { FieldSelectionDictionary } from 'src/stores/Binding/slices/FieldSelection';
import type {
    MaterializationBinding,
    MaterializationBuiltBinding,
    MaterializationFields,
    MaterializationFields_Legacy,
    ValidatedBinding,
} from 'src/types/schemaModels';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback, useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { evaluate_field_selection } from '@estuary/flow-web';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import {
    useEditorStore_liveBuiltSpec,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_currentBindingUUID } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
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
    hasConflicts: boolean;
    recommended: boolean | number;
    selections: FieldSelectionDictionary;
    uuid: string;
}

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

// Call into the flow WASM handler
const evaluateFieldSelection = async (input: FieldSelectionInput) => {
    let response: FieldSelectionResult | undefined;

    try {
        response = evaluate_field_selection(input);
        // We can catch any error here so that any issue causes an empty response and the
        //  component will show an error... though not the most useful one.
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
    } catch (e: any) {
        logRocketEvent('evaluate_field_selection:failed', e);
    }

    return response;
};

export default function useValidateFieldSelection() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const currentBindingUUID = useBinding_currentBindingUUID();
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const initializeSelections = useBindingStore(
        (state) => state.initializeSelections
    );
    const resourceConfigs = useBindingStore((state) => state.resourceConfigs);
    const targetBindingUUIDs = useBindingStore(
        useShallow((state) =>
            Object.entries(state.selections)
                .filter(
                    ([_uuid, { status }]) => status === 'VALIDATION_REQUESTED'
                )
                .map(([uuid, _bindingFieldSelection]) => uuid)
        )
    );
    const setValidationFailure = useBindingStore(
        (state) => state.setValidationFailure
    );

    const draftSpecsRows = useEditorStore_queryResponse_draftSpecs();
    const liveBuiltSpec = useEditorStore_liveBuiltSpec();

    const formStatus = useFormStateStore_status();

    const validateFieldSelection = useCallback(
        async (
            bindingUUID: string,
            draftSpecsRow: DraftSpecQuery,
            builtBindingIndex: number,
            draftedBindingIndex: number,
            validatedBindingIndex: number,
            liveBuiltBindingIndex: number
        ): Promise<FieldSelectionValidationResponse> => {
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

            if (!builtBinding || !draftedBinding || !validatedBinding) {
                return Promise.reject(
                    'data not found: built spec binding, drafted binding, or validation binding'
                );
            }

            let result: FieldSelectionResult | undefined;

            try {
                result = await evaluateFieldSelection({
                    collectionKey: builtBinding.collection.key,
                    collectionProjections: builtBinding.collection.projections,
                    liveSpec: isEdit ? liveBuiltBinding : undefined,
                    model: draftedBinding,
                    validated: validatedBinding,
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection:failed', error);
            }

            return {
                bindingUUID,
                builtBinding,
                fieldStanza: draftedBinding?.fields,
                result,
            };
        },
        [isEdit, liveBuiltSpec]
    );

    const failureDetected = useMemo(
        () => formStatus === FormStatus.FAILED,
        [formStatus]
    );

    useEffect(() => {
        if (
            entityType !== 'materialization' ||
            targetBindingUUIDs.length === 0
        ) {
            return;
        }

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

        let rejectedRequests: {
            collection: string;
            uuid: string;
            validationEligible: boolean;
        }[] = [];

        let validatedRequests: ValidationRequestMetadata[] = [];

        const validationRequests = Object.entries(resourceConfigs)
            .filter(([uuid, _config]) => targetBindingUUIDs.includes(uuid))
            .map(([uuid, { meta }]) => {
                const bindingsExists =
                    meta.builtBindingIndex > -1 &&
                    meta.validatedBindingIndex > -1;

                if (bindingsExists) {
                    advanceHydrationStatus('VALIDATION_REQUESTED', uuid);

                    rejectedRequests.push({
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
                                builtBinding?.collection.projections,
                                builtBinding?.collection.key
                            );

                            validatedRequests.push({
                                hasConflicts: result.hasConflicts,
                                recommended:
                                    fieldStanza?.recommended ??
                                    DEFAULT_RECOMMENDED_FLAG,
                                selections: updatedSelections,
                                uuid: bindingUUID,
                            });

                            rejectedRequests = rejectedRequests.filter(
                                ({ uuid }) => uuid !== bindingUUID
                            );
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
            });
    }, [
        advanceHydrationStatus,
        currentBindingUUID,
        draftSpecsRows,
        enqueueSnackbar,
        entityType,
        failureDetected,
        initializeSelections,
        intl,
        resourceConfigs,
        setValidationFailure,
        targetBindingUUIDs,
        validateFieldSelection,
    ]);
}
