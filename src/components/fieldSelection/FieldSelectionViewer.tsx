import type { BindingFieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useEffect, useMemo } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import RefreshButton from 'src/components/fieldSelection/RefreshButton';
import RefreshStatus from 'src/components/fieldSelection/RefreshStatus';
import FieldSelectionTable from 'src/components/tables/FieldSelection';
import useFieldSelection from 'src/hooks/fieldSelection/useFieldSelection';
import useFieldSelectionAlgorithm from 'src/hooks/fieldSelection/useFieldSelectionAlgorithm';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import {
    DEFAULT_RECOMMENDED_FLAG,
    getFieldSelection,
} from 'src/utils/fieldSelection-utils';

interface Props {
    bindingUUID: string;
    collectionName: string;
    refreshRequired: boolean;
}

function FieldSelectionViewer({
    bindingUUID,
    collectionName,
    refreshRequired,
}: Props) {
    const applyFieldSelections = useFieldSelection(bindingUUID, collectionName);
    const { validateFieldSelection } = useFieldSelectionAlgorithm();

    // Bindings Store
    const setRecommendFields = useBindingStore(
        (state) => state.setRecommendFields
    );
    const initializeSelections = useBindingStore(
        (state) => state.initializeSelections
    );
    const stagedBindingIndex = useBinding_currentBindingIndex();
    const advanceHydrationStatus = useBindingStore(
        (state) => state.advanceHydrationStatus
    );
    const selections = useBindingStore((state) => state.selections);

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const formStatus = useFormStateStore_status();
    const setFormState = useFormStateStore_setFormState();

    const serverDataExists = useMemo(
        () =>
            Boolean(
                draftSpecs.length > 0 &&
                    draftSpecs[0].built_spec &&
                    draftSpecs[0].validated
            ),
        [draftSpecs]
    );

    const bindingSelection: BindingFieldSelection | undefined = useMemo(
        () => selections?.[bindingUUID],
        [bindingUUID, selections]
    );

    useEffect(() => {
        if (
            serverDataExists &&
            bindingSelection?.status === 'VALIDATION_REQUESTED'
        ) {
            advanceHydrationStatus('VALIDATION_REQUESTED', bindingUUID);

            validateFieldSelection().then(
                ({ builtBinding, fieldStanza, response }) => {
                    if (!response) {
                        return;
                    }

                    const updatedSelections = getFieldSelection(
                        response.outcomes,
                        fieldStanza,
                        builtBinding.collection.projections
                    );

                    setRecommendFields(
                        bindingUUID,
                        fieldStanza?.recommended ?? DEFAULT_RECOMMENDED_FLAG
                    );
                    initializeSelections(
                        bindingUUID,
                        updatedSelections,
                        response.hasConflicts
                    );
                },
                () => {}
            );
        }
    }, [
        advanceHydrationStatus,
        bindingUUID,
        collectionName,
        draftSpecs,
        bindingSelection?.status,
        initializeSelections,
        serverDataExists,
        setRecommendFields,
        stagedBindingIndex,
        validateFieldSelection,
    ]);

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    useEffect(() => {
        if (
            draftSpec &&
            bindingSelection?.status === 'SCOPED_SERVER_UPDATE_REQUESTED'
        ) {
            setFormState({ status: FormStatus.UPDATING });
            advanceHydrationStatus(
                'SCOPED_SERVER_UPDATE_REQUESTED',
                bindingUUID
            );

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
                    advanceHydrationStatus('SERVER_UPDATING', bindingUUID);
                });
        }
    }, [
        advanceHydrationStatus,
        applyFieldSelections,
        bindingSelection?.status,
        bindingUUID,
        draftSpec,
        setFormState,
    ]);

    const loading =
        bindingSelection?.hydrating ||
        formActive ||
        formStatus === FormStatus.TESTING_BACKGROUND;

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

            <FieldSelectionTable
                bindingUUID={bindingUUID}
                missingServerData={!serverDataExists}
            />
        </Box>
    );
}

export default FieldSelectionViewer;
