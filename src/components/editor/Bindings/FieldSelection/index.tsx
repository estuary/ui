import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import {
    BuiltSpec_Binding,
    CompositeProjection,
    ConstraintDictionary,
    ConstraintTypes,
    FieldSelectionType,
    Projection,
    TranslatedConstraint,
    ValidationResponse_Binding,
} from 'components/editor/Bindings/FieldSelection/types';
import useFieldSelection from 'components/editor/Bindings/FieldSelection/useFieldSelection';
import {
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_selectionSaving,
    useBindingsEditorStore_setRecommendFields,
    useBindingsEditorStore_setSelectionSaving,
    useBindingsEditorStore_setSingleSelection,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import ExternalLink from 'components/shared/ExternalLink';
import FieldSelectionTable from 'components/tables/FieldSelection';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { isEqual } from 'lodash';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Schema } from 'types';

interface Props {
    collectionName: string;
}

interface FieldMetadata {
    recommended: boolean;
    include?: { [field: string]: any };
    exclude?: string[];
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

        let selectionType: FieldSelectionType | null = 'default';

        if (fieldMetadata) {
            const { recommended, include, exclude } = fieldMetadata;

            if (include && Object.hasOwn(include, field)) {
                selectionType = 'include';
            } else if (exclude?.includes(field)) {
                selectionType = 'exclude';
            } else if (!recommended && constraint) {
                const includeRequired =
                    constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                    constraint.type === ConstraintTypes.LOCATION_REQUIRED;

                selectionType = includeRequired ? 'include' : null;
            }
        }

        return {
            field,
            inference,
            ptr,
            constraint,
            selectionType,
        };
    });

function FieldSelectionViewer({ collectionName }: Props) {
    const applyFieldSelections = useFieldSelection(collectionName);

    // Bindings Editor Store
    const recommendFields = useBindingsEditorStore_recommendFields();
    const setRecommendFields = useBindingsEditorStore_setRecommendFields();

    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    const selectionSaving = useBindingsEditorStore_selectionSaving();
    const setSelectionSaving = useBindingsEditorStore_setSelectionSaving();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    const [data, setData] = useState<
        CompositeProjection[] | null | undefined
    >();

    useEffect(() => {
        if (
            draftSpecs.length > 0 &&
            draftSpecs[0].built_spec &&
            draftSpecs[0].validated
        ) {
            // Select the binding from the built spec that corresponds to the current collection
            // to extract the projection information.
            const builtSpecBindings: BuiltSpec_Binding[] =
                draftSpecs[0].built_spec.bindings;

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

                const evaluatedConstraints: ConstraintDictionary | undefined =
                    validationBindings.find((binding) =>
                        isEqual(
                            binding.resourcePath,
                            selectedBuiltSpecBinding.resourcePath
                        )
                    )?.constraints;

                const selectedBinding: Schema | undefined =
                    draftSpecs[0].spec.bindings.find(
                        (binding: any) => binding.source === collectionName
                    );

                let evaluatedFieldMetadata: FieldMetadata | undefined;

                if (
                    selectedBinding &&
                    Object.hasOwn(selectedBinding, 'fields')
                ) {
                    evaluatedFieldMetadata = selectedBinding.fields;

                    setRecommendFields(selectedBinding.fields.recommended);
                }

                if (evaluatedConstraints) {
                    const compositeProjections = mapConstraintsToProjections(
                        evaluatedProjections,
                        evaluatedConstraints,
                        evaluatedFieldMetadata
                    );

                    compositeProjections.forEach(({ field, selectionType }) =>
                        setSingleSelection(field, selectionType, true)
                    );

                    setData(compositeProjections);
                } else {
                    setData(null);
                }
            } else {
                setData(null);
            }
        } else {
            setData(null);
        }
    }, [
        setData,
        setRecommendFields,
        setSingleSelection,
        collectionName,
        draftSpecs,
    ]);

    const toggleRecommendFields = useCallback(
        (event: SyntheticEvent, checked) => {
            event.preventDefault();
            event.stopPropagation();

            setRecommendFields(!recommendFields);

            data?.forEach(({ field, constraint }) => {
                if (!checked && constraint) {
                    const includeRequired =
                        constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                        constraint.type === ConstraintTypes.LOCATION_REQUIRED;

                    setSingleSelection(
                        field,
                        includeRequired ? 'include' : null
                    );
                } else {
                    setSingleSelection(field, 'default');
                }
            });
        },
        [setRecommendFields, setSingleSelection, data, recommendFields]
    );

    useEffect(() => {
        if (selectionSaving && draftSpecs.length > 0 && draftSpecs[0].spec) {
            setFormState({ status: FormStatus.UPDATING });

            applyFieldSelections(draftSpecs[0])
                .then(
                    () => {
                        console.log('success');

                        setFormState({ status: FormStatus.UPDATED });
                    },
                    (error) => console.log('error', error)
                )
                .finally(() => setSelectionSaving(false));
        }
    }, [
        applyFieldSelections,
        setFormState,
        setSelectionSaving,
        draftSpecs,
        selectionSaving,
    ]);

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ mr: 0.5 }}>
                    <FormattedMessage id="fieldSelection.header" />
                </Typography>

                <ExternalLink link="https://docs.estuary.dev/concepts/materialization/#projected-fields">
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
            </Stack>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage id="fieldSelection.message" />
            </Typography>

            <FormControl sx={{ mb: 1, mx: 0 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            value={recommendFields}
                            checked={recommendFields}
                            icon={<Square style={{ fontSize: 14 }} />}
                            checkedIcon={
                                <CheckSquare style={{ fontSize: 14 }} />
                            }
                            disabled={selectionSaving || !data}
                        />
                    }
                    onChange={toggleRecommendFields}
                    label={
                        <FormattedMessage id="fieldSelection.cta.defaultAllFields" />
                    }
                />
            </FormControl>

            <FieldSelectionTable projections={data} />
        </Box>
    );
}

export default FieldSelectionViewer;
