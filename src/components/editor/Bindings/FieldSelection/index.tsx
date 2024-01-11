import { Box, Stack, Typography } from '@mui/material';
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
    useBindingsEditorStore_selectionSaving,
    useBindingsEditorStore_setRecommendFields,
    useBindingsEditorStore_setSelectionSaving,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import FieldSelectionTable, {
    columns,
    optionalColumnIntlKeys,
} from 'components/tables/FieldSelection';
import SelectColumnMenu from 'components/tables/SelectColumnMenu';
import { useDisplayTableColumns } from 'context/TableSettings';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { isEqual } from 'lodash';
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEndpointConfig_serverUpdateRequired } from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { useResourceConfig_serverUpdateRequired } from 'stores/ResourceConfig/hooks';
import { TablePrefixes } from 'stores/Tables/hooks';
import { Schema, TableColumns } from 'types';
import { WithRequiredNonNullProperty } from 'types/utils';
import { hasLength } from 'utils/misc-utils';
import {
    evaluateRequiredIncludedFields,
    getBindingIndex,
} from 'utils/workflow-utils';
import RefreshStatus from './RefreshStatus';
import useFieldSelectionRefresh from './useFieldSelectionRefresh';

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

const optionalColumns = columns.filter(
    (
        column
    ): column is WithRequiredNonNullProperty<TableColumns, 'headerIntlKey'> =>
        typeof column.headerIntlKey === 'string' &&
        hasLength(column.headerIntlKey)
            ? Object.values(optionalColumnIntlKeys).includes(
                  column.headerIntlKey
              )
            : false
);

function FieldSelectionViewer({ collectionName }: Props) {
    const intl = useIntl();

    const { tableSettings, setTableSettings } = useDisplayTableColumns();

    const isEdit = useEntityWorkflow_Editing();
    const fireBackgroundTest = useRef(isEdit);

    const [refreshRequired, setRefreshRequired] = useState(false);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [data, setData] = useState<
        CompositeProjection[] | null | undefined
    >();

    const applyFieldSelections = useFieldSelection(collectionName);
    const { refresh } = useFieldSelectionRefresh();

    // Bindings Editor Store
    const setRecommendFields = useBindingsEditorStore_setRecommendFields();

    const initializeSelections = useBindingsEditorStore_initializeSelections();

    const selectionSaving = useBindingsEditorStore_selectionSaving();
    const setSelectionSaving = useBindingsEditorStore_setSelectionSaving();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const resourceRequiresUpdate = useResourceConfig_serverUpdateRequired();

    useEffect(() => {
        return () => {
            // Mainly for when a user enters edit and their initial bg test fails
            //  want to make sure we fire off another bg test if they click on
            //  next and not refresh after updating the config.
            if (isEdit && formStatus === FormStatus.FAILED) {
                fireBackgroundTest.current = true;
            }
        };
    }, [formStatus, isEdit]);

    useEffect(() => {
        // If we need an update at the same time we are generating then we need to show
        //  the refresh message.
        if (
            (resourceRequiresUpdate || serverUpdateRequired) &&
            formStatus === FormStatus.GENERATING
        ) {
            setRefreshRequired(true);
        } else if (formStatus === FormStatus.TESTED) {
            // If we are here then the flag might be true and we only can stop showing it
            //  if there is a test ran. This is kinda janky as a test does not 100% guarantee
            //  a built spec but it is pretty darn close.
            setRefreshRequired(false);
        }
    }, [formStatus, resourceRequiresUpdate, serverUpdateRequired]);

    useEffect(() => {
        const hasDraftSpec = draftSpecs.length > 0;

        if (
            hasDraftSpec &&
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
            if (hasDraftSpec && formStatus === FormStatus.GENERATED) {
                if (fireBackgroundTest.current) {
                    fireBackgroundTest.current = false;
                    setRefreshRequired(false);
                    logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_AUTO);
                    void refresh(draftId);
                }
            }

            setData(null);
        }
    }, [
        collectionName,
        draftId,
        draftSpecs,
        formStatus,
        initializeSelections,
        refresh,
        setRecommendFields,
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

    useMount(() => {
        const existingSettings = tableSettings ?? {};

        if (
            !tableSettings ||
            !Object.hasOwn(tableSettings, TablePrefixes.fieldSelection)
        ) {
            setTableSettings({
                ...existingSettings,
                [TablePrefixes.fieldSelection]: {
                    hiddenColumns: optionalColumns.map((column) =>
                        column.headerIntlKey
                            ? intl.formatMessage({ id: column.headerIntlKey })
                            : ''
                    ),
                },
            });
        }
    });

    const updateTableSettings = (
        event: SyntheticEvent,
        checked: boolean,
        column: string
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const existingSettings = tableSettings ?? {};

        const hiddenColumns = Object.hasOwn(
            existingSettings,
            TablePrefixes.fieldSelection
        )
            ? existingSettings[TablePrefixes.fieldSelection].hiddenColumns
            : [];

        const evaluatedSettings =
            checked && hiddenColumns.includes(column)
                ? {
                      ...existingSettings,
                      [TablePrefixes.fieldSelection]: {
                          hiddenColumns: hiddenColumns.filter(
                              (value) => value !== column
                          ),
                      },
                  }
                : !checked && !hiddenColumns.includes(column)
                ? {
                      ...existingSettings,
                      [TablePrefixes.fieldSelection]: {
                          hiddenColumns: [...hiddenColumns, column],
                      },
                  }
                : existingSettings;

        setTableSettings(evaluatedSettings);
    };

    const loading = formActive || formStatus === FormStatus.TESTING_BACKGROUND;

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Stack spacing={1}>
                    <Stack direction="row">
                        <Typography variant="h6" sx={{ mr: 0.5 }}>
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

            <Stack direction="row" sx={{ mb: 1, justifyContent: 'flex-end' }}>
                <SelectColumnMenu
                    columns={optionalColumns}
                    onChange={updateTableSettings}
                    disabled={loading}
                />
            </Stack>

            <FieldSelectionTable projections={data} />
        </Box>
    );
}

export default FieldSelectionViewer;
