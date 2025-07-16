import type {
    CompositeProjection,
    ConstraintDictionary,
    FieldSelectionType,
    Projection,
    TranslatedConstraint,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { Schema } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import RefreshButton from 'src/components/editor/Bindings/FieldSelection/RefreshButton';
import RefreshStatus from 'src/components/editor/Bindings/FieldSelection/RefreshStatus';
import { ConstraintTypes } from 'src/components/editor/Bindings/FieldSelection/types';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import FieldSelectionTable from 'src/components/tables/FieldSelection';
import useFieldSelection from 'src/hooks/fieldSelection/useFieldSelection';
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
import {
    getRelatedBindings,
    isRecommendedField,
} from 'src/utils/workflow-utils';

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
                const { builtBinding, draftedBinding, validationBinding } =
                    getRelatedBindings(
                        draftSpecs[0].built_spec,
                        draftSpecs[0].spec,
                        stagedBindingIndex,
                        collectionName,
                        draftSpecs[0].validated
                    );

                if (builtBinding) {
                    const evaluatedProjections =
                        builtBinding.collection.projections;

                    const evaluatedConstraints:
                        | ConstraintDictionary
                        | undefined = validationBinding?.constraints;

                    let evaluatedFieldMetadata: FieldMetadata | undefined;

                    if (
                        draftedBinding &&
                        Object.hasOwn(draftedBinding, 'fields')
                    ) {
                        evaluatedFieldMetadata = draftedBinding.fields;

                        setRecommendFields(
                            bindingUUID,
                            draftedBinding.fields.recommended
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
                                    constraint,
                                    field,
                                    selectionMetadata,
                                    selectionType,
                                }) => ({
                                    constraintType: constraint?.type,
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
