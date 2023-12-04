import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import RefreshButton from 'components/editor/Bindings/FieldSelection/RefreshButton';
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
    useBindingsEditorStore_initializeSelections,
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_selectionSaving,
    useBindingsEditorStore_setRecommendFields,
    useBindingsEditorStore_setSelectionSaving,
    useBindingsEditorStore_setSingleSelection,
} from 'components/editor/Bindings/Store/hooks';
import { useEditorStore_queryResponse_draftSpecs } from 'components/editor/Store/hooks';
import useSaveInBackground from 'components/shared/Entity/Actions/useSaveInBackground';
import FieldSelectionTable from 'components/tables/FieldSelection';
import { isEqual } from 'lodash';
import {
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/types';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Schema } from 'types';
import {
    evaluateRequiredIncludedFields,
    getBindingIndex,
} from 'utils/workflow-utils';

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
                const includeRequired = evaluateRequiredIncludedFields(
                    constraint.type
                );

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
    useSaveInBackground();

    const applyFieldSelections = useFieldSelection(collectionName);

    // Bindings Editor Store
    const recommendFields = useBindingsEditorStore_recommendFields();
    const setRecommendFields = useBindingsEditorStore_setRecommendFields();

    const initializeSelections = useBindingsEditorStore_initializeSelections();
    const setSingleSelection = useBindingsEditorStore_setSingleSelection();

    const selectionSaving = useBindingsEditorStore_selectionSaving();
    const setSelectionSaving = useBindingsEditorStore_setSelectionSaving();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    const [data, setData] = useState<
        CompositeProjection[] | null | undefined
    >();

    const [saveInProgress, setSaveInProgress] = useState(false);

    useEffect(() => {
        if (
            draftSpecs.length > 0 &&
            draftSpecs[0].built_spec &&
            draftSpecs[0].validated
        ) {
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

                const evaluatedConstraints: ConstraintDictionary | undefined =
                    validationBindings.find((binding) =>
                        isEqual(
                            binding.resourcePath,
                            selectedBuiltSpecBinding.resourcePath
                        )
                    )?.constraints;

                const bindingIndex: number = getBindingIndex(
                    draftSpecs[0].spec.bindings,
                    collectionName
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

                    setRecommendFields(selectedBinding.fields.recommended);
                } else {
                    setRecommendFields(true);
                }

                if (evaluatedConstraints) {
                    const compositeProjections = mapConstraintsToProjections(
                        evaluatedProjections,
                        evaluatedConstraints,
                        evaluatedFieldMetadata
                    );

                    const selections = compositeProjections.map(
                        ({ field, selectionType }) => ({ field, selectionType })
                    );

                    initializeSelections(selections);
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
        collectionName,
        draftSpecs,
        initializeSelections,
        setData,
        setRecommendFields,
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
                    () => setFormState({ status: FormStatus.UPDATED }),
                    (error) =>
                        setFormState({ status: FormStatus.FAILED, error })
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
        <Box sx={{ mt: 3 }}>
            <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 2, justifyContent: 'space-between' }}
            >
                <Stack spacing={1}>
                    <Stack direction="row">
                        <Typography variant="h6" sx={{ mr: 0.5 }}>
                            <FormattedMessage id="fieldSelection.header" />
                        </Typography>

                        <RefreshButton
                            buttonLabelId="cta.refresh"
                            disabled={loading}
                            logEvent={CustomEvents.MATERIALIZATION_TEST}
                        />
                    </Stack>

                    <Typography>
                        <MessageWithLink messageID="fieldSelection.message" />
                    </Typography>
                </Stack>
            </Stack>

            <FormControl sx={{ mb: 1, mx: 0 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            value={recommendFields}
                            checked={recommendFields}
                            disabled={loading || !data}
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
