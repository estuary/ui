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
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import FieldSelectionTable, {
    columns,
    optionalColumnIntlKeys,
} from 'components/tables/FieldSelection';
import FieldFilter from 'components/tables/FieldSelection/FieldFilter';
import SelectColumnMenu from 'components/tables/SelectColumnMenu';
import { useDisplayTableColumns } from 'context/TableSettings';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { isEqual } from 'lodash';
import { SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import {
    useBinding_currentBindingIndex,
    useBinding_initializeSelections,
    useBinding_recommendFields,
    useBinding_selectionSaving,
    useBinding_serverUpdateRequired,
    useBinding_setRecommendFields,
    useBinding_setSelectionSaving,
} from 'stores/Binding/hooks';
import { useEndpointConfig_serverUpdateRequired } from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { TablePrefixes } from 'stores/Tables/hooks';
import { Schema, TableColumns } from 'types';
import { WithRequiredNonNullProperty } from 'types/utils';
import { BooleanParam, useQueryParam } from 'use-query-params';
import { hasLength } from 'utils/misc-utils';
import {
    evaluateRequiredIncludedFields,
    getBindingIndex,
} from 'utils/workflow-utils';
import FieldActionButton from './FieldActionButton';
import RefreshStatus from './RefreshStatus';
import useFieldSelectionRefresh from './useFieldSelectionRefresh';

interface Props {
    bindingUUID: string;
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

function FieldSelectionViewer({ bindingUUID, collectionName }: Props) {
    const { 1: setForcedEnable } = useQueryParam(
        GlobalSearchParams.FORCED_SHARD_ENABLE,
        BooleanParam
    );
    const { tableSettings, setTableSettings } = useDisplayTableColumns();

    const isEdit = useEntityWorkflow_Editing();
    const fireBackgroundTest = useRef(isEdit);

    const [refreshRequired, setRefreshRequired] = useState(false);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [data, setData] = useState<
        CompositeProjection[] | null | undefined
    >();

    const applyFieldSelections = useFieldSelection(bindingUUID, collectionName);
    const { refresh } = useFieldSelectionRefresh();

    // Bindings Store
    const recommended = useBinding_recommendFields();
    const setRecommendFields = useBinding_setRecommendFields();
    const initializeSelections = useBinding_initializeSelections();
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const selectionSaving = useBinding_selectionSaving();
    const setSelectionSaving = useBinding_setSelectionSaving();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const draftId = useEditorStore_id();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const resourceRequiresUpdate = useBinding_serverUpdateRequired();

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

                        const selections = compositeProjections.map(
                            ({ field, selectionType }) => ({
                                field,
                                selectionType,
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
            if (hasDraftSpec && formStatus === FormStatus.GENERATED) {
                if (fireBackgroundTest.current) {
                    // We only want to force an update if the spec is disabled. This way when a
                    //  test is ran there wil not be an error and the backend will connect to the
                    // connector.  When the user goes to saves we will flip this back
                    const forceEnabled = Boolean(
                        draftSpecs[0].spec?.shards?.disable
                    );

                    // Only update the param to keep track when we do this so if someone
                    //  reloads the page their draft will get switched back properly
                    if (forceEnabled) {
                        setForcedEnable(forceEnabled);
                    }

                    fireBackgroundTest.current = false;
                    setRefreshRequired(false);
                    logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_AUTO);

                    void refresh(draftId, forceEnabled);
                }
            }

            setData(null);
        }
    }, [
        bindingUUID,
        collectionName,
        draftId,
        draftSpecs,
        formActive,
        formStatus,
        initializeSelections,
        refresh,
        setForcedEnable,
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

    const updateTableSettings = (
        event: SyntheticEvent,
        checked: boolean,
        column: string
    ) => {
        event.preventDefault();
        event.stopPropagation();

        const existingSettings = tableSettings ?? {};

        const shownOptionalColumns = Object.hasOwn(
            existingSettings,
            TablePrefixes.fieldSelection
        )
            ? existingSettings[TablePrefixes.fieldSelection]
                  .shownOptionalColumns
            : [];

        const columnShown = shownOptionalColumns.includes(column);

        const evaluatedSettings =
            !checked && columnShown
                ? {
                      ...existingSettings,
                      [TablePrefixes.fieldSelection]: {
                          shownOptionalColumns: shownOptionalColumns.filter(
                              (value) => value !== column
                          ),
                      },
                  }
                : checked && !columnShown
                ? {
                      ...existingSettings,
                      [TablePrefixes.fieldSelection]: {
                          shownOptionalColumns: [
                              ...shownOptionalColumns,
                              column,
                          ],
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

            <Stack
                direction="row"
                sx={{
                    mb: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <FieldActionButton
                        bindingUUID={bindingUUID}
                        disabled={!recommended[bindingUUID] || loading}
                        labelId="fieldSelection.table.cta.defaultAllFields"
                        projections={data}
                        selectedValue="default"
                    />

                    <FieldActionButton
                        bindingUUID={bindingUUID}
                        disabled={loading}
                        labelId="fieldSelection.table.cta.excludeAllFields"
                        projections={data}
                        selectedValue="exclude"
                    />
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <FieldFilter disabled={loading} />

                    <SelectColumnMenu
                        columns={optionalColumns}
                        onChange={updateTableSettings}
                        disabled={loading}
                    />
                </Stack>
            </Stack>

            <FieldSelectionTable projections={data} />
        </Box>
    );
}

export default FieldSelectionViewer;
