import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type {
    BuiltBinding,
    MaterializationBinding,
    MaterializationFields,
    MaterializationFields_Legacy,
    ValidatedBinding,
} from 'src/types/schemaModels';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { evaluate_field_selection } from '@estuary/flow-web';
import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';
import { snackbarSettings } from 'src/utils/notification-utils';

interface FieldSelectionValidationResponse {
    bindingUUID: string;
    builtBinding: BuiltBinding;
    fieldStanza:
        | MaterializationFields
        | MaterializationFields_Legacy
        | undefined;
    result: FieldSelectionResult | undefined;
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

    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const initializeSelections = useBindingStore(
        (state) => state.initializeSelections
    );
    const resourceConfigs = useBindingStore((state) => state.resourceConfigs);
    const setRecommendFields = useBindingStore(
        (state) => state.setRecommendFields
    );
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

    const validateFieldSelection = useCallback(
        async (
            bindingUUID: string,
            draftSpecsRow: DraftSpecQuery,
            builtBindingIndex: number,
            draftedBindingIndex: number,
            validatedBindingIndex: number
        ): Promise<FieldSelectionValidationResponse> => {
            const builtBinding: BuiltBinding | undefined =
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
                    liveSpec: isEdit ? builtBinding : undefined,
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
        [isEdit]
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
            return;
        }

        let rejectedRequests: { collection: string; uuid: string }[] = [];

        const validationRequests = Object.entries(resourceConfigs)
            .filter(([uuid, _config]) => targetBindingUUIDs.includes(uuid))
            .map(([uuid, { meta }]) => {
                rejectedRequests.push({
                    collection: meta.collectionName,
                    uuid,
                });

                advanceHydrationStatus('VALIDATION_REQUESTED', uuid);

                return validateFieldSelection(
                    uuid,
                    draftSpecsRow,
                    meta.builtBindingIndex,
                    meta.bindingIndex,
                    meta.validatedBindingIndex
                );
            });

        Promise.allSettled(validationRequests)
            .then(
                (responses) => {
                    responses.forEach((response) => {
                        if (isPromiseFulfilledResult(response)) {
                            if (!response.value.result) {
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

                            setRecommendFields(
                                bindingUUID,
                                fieldStanza?.recommended ??
                                    DEFAULT_RECOMMENDED_FLAG
                            );
                            initializeSelections(
                                bindingUUID,
                                updatedSelections,
                                result.hasConflicts
                            );

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
                if (rejectedRequests.length > 0) {
                    rejectedRequests.forEach(({ collection, uuid }) => {
                        enqueueSnackbar(
                            intl.formatMessage(
                                {
                                    id: 'fieldSelection.error.validationFailed',
                                },
                                { collection }
                            ),
                            { ...snackbarSettings, variant: 'error' }
                        );

                        setValidationFailure(uuid);
                    });
                }
            });
    }, [
        advanceHydrationStatus,
        draftSpecsRows,
        enqueueSnackbar,
        entityType,
        initializeSelections,
        intl,
        resourceConfigs,
        setRecommendFields,
        setValidationFailure,
        targetBindingUUIDs,
        validateFieldSelection,
    ]);
}
