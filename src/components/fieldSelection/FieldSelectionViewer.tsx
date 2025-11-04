import type { FieldSelectionViewerProps } from 'src/components/fieldSelection/types';
import type { BindingFieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useEffect, useMemo } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { useSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import KeyChangeAlert from 'src/components/fieldSelection/FieldActions/GroupByKeys/KeyChangeAlert';
import RefreshButton from 'src/components/fieldSelection/RefreshButton';
import RefreshStatus from 'src/components/fieldSelection/RefreshStatus';
import FieldSelectionTable from 'src/components/tables/FieldSelection';
import useFieldSelection from 'src/hooks/fieldSelection/useFieldSelection';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { snackbarSettings } from 'src/utils/notification-utils';

function FieldSelectionViewer({
    bindingUUID,
    collectionName,
    refreshRequired,
    refresh,
}: FieldSelectionViewerProps) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const { applyFieldSelection } = useFieldSelection(
        bindingUUID,
        collectionName
    );

    const collectionEdited = useWorkflowStore((state) => {
        return Boolean(state.collections[collectionName]?.belongsToDraft);
    });

    // Bindings Store
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const selections = useBindingStore((state) => state.selections);
    const setValidationFailure = useBindingStore(
        (state) => state.setValidationFailure
    );

    // Draft Editor Store
    const draftSpecsRows = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    const serverDataExists = useMemo(
        () =>
            Boolean(
                collectionName &&
                    draftSpecsRows.length > 0 &&
                    draftSpecsRows[0].spec &&
                    draftSpecsRows[0].built_spec &&
                    draftSpecsRows[0].validated
            ),
        [collectionName, draftSpecsRows]
    );

    const bindingSelection: BindingFieldSelection | undefined = useMemo(
        () => selections?.[bindingUUID],
        [bindingUUID, selections]
    );

    const draftSpec = useMemo(
        () =>
            draftSpecsRows.length > 0 && draftSpecsRows[0].spec
                ? draftSpecsRows[0]
                : null,
        [draftSpecsRows]
    );

    useEffect(() => {
        if (
            draftSpec &&
            bindingSelection?.status === 'SERVER_UPDATE_REQUESTED'
        ) {
            setFormState({ status: FormStatus.UPDATING });
            advanceHydrationStatus('SERVER_UPDATE_REQUESTED', bindingUUID);

            // TODO (field selection): Extend error handling.
            applyFieldSelection(draftSpec).then(
                () => {
                    setFormState({ status: FormStatus.UPDATED });

                    advanceHydrationStatus('SERVER_UPDATING', bindingUUID);
                },
                (error) => {
                    setFormState({
                        status: FormStatus.FAILED,
                        error: {
                            title: 'fieldSelection.error.serverUpdateFailed',
                            error,
                        },
                    });

                    enqueueSnackbar(
                        intl.formatMessage(
                            {
                                id: 'fieldSelection.error.validationFailed',
                            },
                            { collection: collectionName }
                        ),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setValidationFailure([bindingUUID], true);
                }
            );
        }
    }, [
        advanceHydrationStatus,
        applyFieldSelection,
        bindingSelection?.status,
        bindingUUID,
        collectionName,
        draftSpec,
        enqueueSnackbar,
        intl,
        setFormState,
        setValidationFailure,
    ]);

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
                            refresh={refresh}
                        />
                    </Stack>

                    <KeyChangeAlert bindingUUID={bindingUUID} />

                    <RefreshStatus
                        show={
                            collectionEdited || refreshRequired
                                ? true
                                : undefined
                        }
                    />

                    <Typography component="div">
                        <MessageWithLink messageID="fieldSelection.message" />
                    </Typography>
                </Stack>
            </Stack>

            <FieldSelectionTable
                bindingUUID={bindingUUID}
                missingServerData={!serverDataExists}
            />
        </Box>
    );
}

export default FieldSelectionViewer;
