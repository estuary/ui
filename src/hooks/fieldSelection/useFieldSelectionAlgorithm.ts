import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type {
    BaseMaterializationFields,
    BuiltBinding,
    MaterializationBinding,
    ValidatedBinding,
} from 'src/types/schemaModels';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { evaluate_field_selection } from '@estuary/flow-web';
import { cloneDeep } from 'lodash';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';

export interface AlgorithmConfig {
    depth?: number;
    exclude?: BaseMaterializationFields['exclude'];
    reset?: boolean;
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

export default function useFieldSelectionAlgorithm() {
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

    const draftSpecsRows = useEditorStore_queryResponse_draftSpecs();

    const validateFieldSelection = useCallback(
        async (
            bindingUUID: string,
            draftSpecsRow: DraftSpecQuery,
            builtBindingIndex: number,
            draftedBindingIndex: number,
            validatedBindingIndex: number
        ) => {
            const builtBinding: BuiltBinding | undefined =
                draftSpecsRow.built_spec?.bindings.at(builtBindingIndex);

            const draftedBinding: MaterializationBinding | undefined =
                draftSpecsRow.spec.bindings.at(draftedBindingIndex);

            const validatedBinding: ValidatedBinding | undefined =
                draftSpecsRow.validated?.bindings.at(validatedBindingIndex);

            if (!builtBinding || !draftedBinding || !validatedBinding) {
                return Promise.reject(
                    'data not found: built spec binding, drafted binding, or validation binding'
                );
            }

            let response: FieldSelectionResult | undefined;

            try {
                response = await evaluateFieldSelection({
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
                response,
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
            draftSpecsRows.length !== 0
                ? cloneDeep(draftSpecsRows[0])
                : undefined;

        if (
            !draftSpecsRow ||
            !draftSpecsRow.built_spec ||
            !draftSpecsRow.validated
        ) {
            return;
        }

        const validationRequests = Object.entries(resourceConfigs)
            .filter(([uuid, _config]) => targetBindingUUIDs.includes(uuid))
            .map(([uuid, { meta }]) => {
                advanceHydrationStatus('VALIDATION_REQUESTED', uuid);

                return validateFieldSelection(
                    uuid,
                    draftSpecsRow,
                    meta.builtBindingIndex,
                    meta.bindingIndex,
                    meta.validatedBindingIndex
                );
            });

        Promise.all(validationRequests).then(
            (responses) => {
                responses.forEach(
                    ({ bindingUUID, builtBinding, fieldStanza, response }) => {
                        if (!response) {
                            return;
                        }

                        const updatedSelections = getFieldSelection(
                            response.outcomes,
                            fieldStanza,
                            builtBinding?.collection.projections
                        );

                        setRecommendFields(
                            bindingUUID,
                            fieldStanza?.recommended ?? DEFAULT_RECOMMENDED_FLAG
                        );
                        initializeSelections(
                            bindingUUID,
                            updatedSelections,
                            response.hasConflicts
                        );
                    }
                );
            },
            (error) => {
                console.log('>>> validation error', error);
            }
        );
    }, [
        advanceHydrationStatus,
        draftSpecsRows,
        entityType,
        initializeSelections,
        resourceConfigs,
        setRecommendFields,
        targetBindingUUIDs,
        validateFieldSelection,
    ]);
}
