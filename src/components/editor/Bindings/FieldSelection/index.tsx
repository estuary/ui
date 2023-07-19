import {
    BuiltSpec_Binding,
    CompositeProjection,
    ConstraintDictionary,
    ConstraintTypes,
    Projection,
    ValidationResponse_Binding,
} from 'components/editor/Bindings/FieldSelection/types';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import FieldSelectionTable from 'components/tables/FieldSelection';
import { isEqual } from 'lodash';
import { useMemo } from 'react';

interface Props {
    collectionName: string;
}

const mapConstraintsToProjections = (
    projections: Projection[],
    constraints: ConstraintDictionary
): CompositeProjection[] =>
    projections.map(({ field, inference, ptr }) => ({
        field,
        inference,
        ptr,
        constraint: Object.hasOwn(constraints, field)
            ? {
                  type: ConstraintTypes[constraints[field].type],
                  reason: constraints[field].reason,
              }
            : null,
    }));

function FieldSelectionViewer({ collectionName }: Props) {
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

                return evaluatedConstraints
                    ? mapConstraintsToProjections(
                          evaluatedProjections,
                          evaluatedConstraints
                      )
                    : null;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }, [collectionName, draftSpecs]);

    return <FieldSelectionTable projections={data} />;
}

export default FieldSelectionViewer;
