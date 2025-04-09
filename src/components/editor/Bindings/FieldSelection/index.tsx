import type {
    BuiltSpec_Binding,
    CompositeProjection,
    ConstraintDictionary,
    FieldSelectionType,
    Projection,
    TranslatedConstraint,
    ValidationResponse_Binding,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { Schema } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import RefreshButton from 'src/components/editor/Bindings/FieldSelection/RefreshButton';
import RefreshStatus from 'src/components/editor/Bindings/FieldSelection/RefreshStatus';
import { ConstraintTypes } from 'src/components/editor/Bindings/FieldSelection/types';
import useFieldSelection from 'src/components/editor/Bindings/FieldSelection/useFieldSelection';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import FieldSelectionTable from 'src/components/tables/FieldSelection';
import {
    useBinding_currentBindingIndex,
    useBinding_initializeSelections,
    useBinding_selectionSaving,
    useBinding_setRecommendFields,
    useBinding_setSelectionSaving,
} from 'src/stores/Binding/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { getBindingIndex, isRecommendedField } from 'src/utils/workflow-utils';

interface Props {
    bindingUUID: string;
    collectionName: string;
    refreshRequired: boolean;
}

interface FieldMetadata {
    recommended: boolean;
    exclude?: string[];
    include?: { [field: string]: any };
    require?: { [field: string]: any };
}

const mapConstraintsToProjections = (
    projections: Projection[],
    constraints: ConstraintDictionary,
    fieldMetadata?: FieldMetadata
): CompositeProjection[] =>
    projections.map(({ field, inference, ptr }) => {
        const constraint: TranslatedConstraint | null = Object.hasOwn(
            constraints,
            field
        )
            ? {
                  type: ConstraintTypes[constraints[field].type],
                  reason: constraints[field].reason,
              }
            : null;

        let selectionType: FieldSelectionType | null =
            constraint && isRecommendedField(constraint.type)
                ? 'default'
                : null;

        let selectionMetadata: Schema | undefined;

        if (fieldMetadata) {
            const { exclude, include, recommended, require } = fieldMetadata;

            if (include?.[field]) {
                selectionType = 'require';
                selectionMetadata = include[field];
            } else if (require?.[field]) {
                selectionType = 'require';
                selectionMetadata = require[field];
            } else if (exclude?.includes(field)) {
                selectionType = 'exclude';
            } else if (typeof recommended === 'boolean' && !recommended) {
                selectionType = null;
            }
        }

        return {
            field,
            inference,
            ptr,
            constraint,
            selectionMetadata,
            selectionType,
        };
    });

function FieldSelectionViewer({
    bindingUUID,
    collectionName,
    refreshRequired,
}: Props) {
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [data, setData] = useState<
        CompositeProjection[] | null | undefined
    >();

    const applyFieldSelections = useFieldSelection(bindingUUID, collectionName);

    // Bindings Store
    const setRecommendFields = useBinding_setRecommendFields();
    const initializeSelections = useBinding_initializeSelections();
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const selectionSaving = useBinding_selectionSaving();
    const setSelectionSaving = useBinding_setSelectionSaving();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    useEffect(() => {
        const hasDraftSpec = draftSpecs.length > 0;

        if (
            hasDraftSpec &&
            draftSpecs[0].built_spec &&
            draftSpecs[0].validated
        ) {
            if (!formActive) {
                // Select the binding from the built spec that corresponds to the current collection
                //  to extract the projection information.
                // Defaulting to empty array. This is to handle when a user has disabled a collection
                //  which causes the binding to not be included in the built_spec
                const builtSpecBindings: BuiltSpec_Binding[] =
                    draftSpecs[0].built_spec.bindings ?? [];

                const selectedBuiltSpecBinding: BuiltSpec_Binding | undefined =
                    builtSpecBindings.find(
                        (binding) => binding.collection.name === collectionName
                    );

                if (selectedBuiltSpecBinding) {
                    const evaluatedProjections =
                        selectedBuiltSpecBinding.collection.projections;

                    // The validation phase of a publication produces a document which correlates each binding projection
                    // to a constraint type (defined in flow/go/protocols/materialize/materialize.proto). Select the binding
                    // from the validation document that corresponds to the current collection to extract the constraint types.
                    const validationBindings: ValidationResponse_Binding[] =
                        draftSpecs[0].validated.bindings;

                    const evaluatedConstraints:
                        | ConstraintDictionary
                        | undefined = validationBindings.find((binding) =>
                        isEqual(
                            binding.resourcePath,
                            selectedBuiltSpecBinding.resourcePath
                        )
                    )?.constraints;

                    const bindingIndex: number = getBindingIndex(
                        draftSpecs[0].spec.bindings,
                        collectionName,
                        stagedBindingIndex
                    );
                    const selectedBinding: Schema | undefined =
                        bindingIndex > -1
                            ? draftSpecs[0].spec.bindings[bindingIndex]
                            : undefined;
                    let evaluatedFieldMetadata: FieldMetadata | undefined;

                    if (
                        selectedBinding &&
                        Object.hasOwn(selectedBinding, 'fields')
                    ) {
                        evaluatedFieldMetadata = selectedBinding.fields;

                        setRecommendFields(
                            bindingUUID,
                            selectedBinding.fields.recommended
                        );
                    } else {
                        setRecommendFields(bindingUUID, true);
                    }

                    if (evaluatedConstraints) {
                        const compositeProjections =
                            mapConstraintsToProjections(
                                evaluatedProjections,
                                evaluatedConstraints,
                                evaluatedFieldMetadata
                            );

                        const selections: ExpandedFieldSelection[] =
                            compositeProjections.map(
                                ({
                                    field,
                                    selectionMetadata,
                                    selectionType,
                                }) => ({
                                    field,
                                    meta: selectionMetadata,
                                    mode: selectionType,
                                })
                            );

                        initializeSelections(bindingUUID, selections);
                        setData(compositeProjections);
                    } else {
                        setData(null);
                    }
                } else {
                    setData(null);
                }
            }
        } else {
            setData(null);
        }
    }, [
        bindingUUID,
        collectionName,
        draftSpecs,
        formActive,
        initializeSelections,
        setRecommendFields,
        stagedBindingIndex,
    ]);

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    useEffect(() => {
        if (selectionSaving && !saveInProgress && draftSpec) {
            setFormState({ status: FormStatus.UPDATING });
            setSaveInProgress(true);

            // TODO (field selection): Extend error handling.
            applyFieldSelections(draftSpec)
                .then(
                    () => {
                        setFormState({ status: FormStatus.UPDATED });
                    },
                    (error) => {
                        setFormState({
                            status: FormStatus.FAILED,
                            error: {
                                title: 'fieldSelection.update.failed',
                                error,
                            },
                        });
                    }
                )
                .finally(() => {
                    setSelectionSaving(false);
                    setSaveInProgress(false);
                });
        }
    }, [
        applyFieldSelections,
        draftSpec,
        saveInProgress,
        selectionSaving,
        setFormState,
        setSaveInProgress,
        setSelectionSaving,
    ]);

    const loading = formActive || formStatus === FormStatus.TESTING_BACKGROUND;

    return (
        <Box sx={{ my: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Stack spacing={1}>
                    <Stack style={{ alignItems: 'center' }} direction="row">
                        <Typography
                            sx={{ mr: 0.5 }}
                            variant="formSectionHeader"
                        >
                            <FormattedMessage id="fieldSelection.header" />
                        </Typography>

                        <RefreshButton
                            buttonLabelId="cta.refresh"
                            disabled={loading}
                        />
                    </Stack>

                    <RefreshStatus show={refreshRequired ? true : undefined} />

                    <Typography component="div">
                        <MessageWithLink messageID="fieldSelection.message" />
                    </Typography>
                </Stack>
            </Stack>

            <FieldSelectionTable bindingUUID={bindingUUID} projections={data} />
        </Box>
    );
}

export default FieldSelectionViewer;
