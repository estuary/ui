import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import { modifyDraftSpec } from 'api/draftSpecs';
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
    useBindingsEditorStore_selectionActive,
    useBindingsEditorStore_selectionSaving,
    useBindingsEditorStore_selections,
    useBindingsEditorStore_setRecommendFields,
    useBindingsEditorStore_setSelectionActive,
    useBindingsEditorStore_setSelectionSaving,
    useBindingsEditorStore_setSingleSelection,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import ExternalLink from 'components/shared/ExternalLink';
import FieldSelectionTable from 'components/tables/FieldSelection';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { debounce, isEqual, omit } from 'lodash';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

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
    // Bindings Editor Store
    const recommendFields = useBindingsEditorStore_recommendFields();
    const setRecommendFields = useBindingsEditorStore_setRecommendFields();

    const selections = useBindingsEditorStore_selections();
    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    const selectionActive = useBindingsEditorStore_selectionActive();
    const setSelectionActive = useBindingsEditorStore_setSelectionActive();

    const selectionSaving = useBindingsEditorStore_selectionSaving();
    const setSelectionSaving = useBindingsEditorStore_setSelectionSaving();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

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

    const debouncedUpdate = useCallback(
        debounce(() => {
            setSelectionActive(false);
            setSelectionSaving(true);
        }, 750),
        [setSelectionActive, setSelectionSaving]
    );

    useEffect(() => {
        if (selectionActive) {
            debouncedUpdate();
        }
    }, [debouncedUpdate, selectionActive]);

    const processFieldSelections = useCallback(
        async (draftSpec: DraftSpecQuery) => {
            const includedFields: string[] = Object.entries(selections)
                .filter(
                    ([_field, selectionType]) => selectionType === 'include'
                )
                .map(([field]) => field);

            const excludedFields: string[] = Object.entries(selections)
                .filter(
                    ([_field, selectionType]) => selectionType === 'exclude'
                )
                .map(([field]) => field);

            const bindingIndex: number = draftSpec.spec.bindings.findIndex(
                (binding: any) => binding.source === collectionName
            );

            if (!mutateDraftSpecs || bindingIndex === -1) {
                return Promise.reject();
            } else {
                const spec: Schema = draftSpec.spec;

                spec.bindings[bindingIndex].fields = {
                    recommended: recommendFields,
                    exclude: [],
                    include: {},
                };

                if (
                    hasLength(includedFields) ||
                    hasLength(excludedFields) ||
                    !recommendFields
                ) {
                    if (hasLength(includedFields)) {
                        const formattedFields = {};

                        includedFields.forEach((field) => {
                            formattedFields[field] = {};
                        });

                        spec.bindings[bindingIndex].fields.include =
                            formattedFields;
                    } else {
                        spec.bindings[bindingIndex].fields = omit(
                            spec.bindings[bindingIndex].fields,
                            'include'
                        );
                    }

                    if (hasLength(excludedFields)) {
                        spec.bindings[bindingIndex].fields.exclude =
                            excludedFields;
                    } else {
                        spec.bindings[bindingIndex].fields = omit(
                            spec.bindings[bindingIndex].fields,
                            'exclude'
                        );
                    }
                } else {
                    spec.bindings[bindingIndex] = omit(
                        spec.bindings[bindingIndex],
                        'fields'
                    );
                }

                const updateResponse = await modifyDraftSpec(spec, {
                    draft_id: draftId,
                    catalog_name: draftSpec.catalog_name,
                    spec_type: 'materialization',
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutateDraftSpecs();
            }
        },
        [mutateDraftSpecs, collectionName, draftId, recommendFields, selections]
    );

    useEffect(() => {
        if (selectionSaving && draftSpecs.length > 0 && draftSpecs[0].spec) {
            processFieldSelections(draftSpecs[0])
                .then(
                    () => console.log('success'),
                    (error) => console.log('error', error)
                )
                .finally(() => setSelectionSaving(false));
        }
    }, [
        processFieldSelections,
        setSelectionSaving,
        draftSpecs,
        selectionSaving,
    ]);

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
                            checked={recommendFields}
                            icon={<Square style={{ fontSize: 14 }} />}
                            checkedIcon={
                                <CheckSquare style={{ fontSize: 14 }} />
                            }
                            disabled={!data}
                        />
                    }
                    onChange={toggleRecommendFields}
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
