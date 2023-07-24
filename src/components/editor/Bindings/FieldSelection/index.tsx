import {
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
import {
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_setRecommendFields,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import ExternalLink from 'components/shared/ExternalLink';
import FieldSelectionTable from 'components/tables/FieldSelection';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { isEqual } from 'lodash';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
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

        let selectionType: FieldSelectionType = 'default';

        if (fieldMetadata) {
            const { recommended, include, exclude } = fieldMetadata;

            if (include && Object.hasOwn(include, field)) {
                selectionType = 'include';
            } else if (exclude?.includes(field)) {
                selectionType = 'exclude';
            } else if (!recommended && constraint) {
                const includeRecommended =
                    constraint.type === ConstraintTypes.FIELD_REQUIRED ||
                    constraint.type === ConstraintTypes.LOCATION_REQUIRED ||
                    constraint.type === ConstraintTypes.LOCATION_RECOMMENDED;

                selectionType = includeRecommended ? 'include' : 'exclude';
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
    // Bindings Editor Store
    const recommendFields = useBindingsEditorStore_recommendFields();
    const setRecommendFields = useBindingsEditorStore_setRecommendFields();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const data: CompositeProjection[] | null = useMemo(() => {
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

                return evaluatedConstraints
                    ? mapConstraintsToProjections(
                          evaluatedProjections,
                          evaluatedConstraints,
                          evaluatedFieldMetadata
                      )
                    : null;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }, [setRecommendFields, collectionName, draftSpecs]);

    return (
        <>
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
                            icon={<Square style={{ fontSize: 14 }} />}
                            checkedIcon={
                                <CheckSquare style={{ fontSize: 14 }} />
                            }
                            disabled={!data}
                            defaultChecked
                        />
                    }
                    onChange={() => setRecommendFields(!recommendFields)}
                    label={
                        <FormattedMessage id="fieldSelection.cta.defaultAllFields" />
                    }
                />
            </FormControl>

            <FieldSelectionTable projections={data} />
        </>
    );
}

export default FieldSelectionViewer;
