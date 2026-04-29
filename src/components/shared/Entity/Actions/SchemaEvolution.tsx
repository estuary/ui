import type { FormState } from 'src/stores/FormState/types';

import { useCallback } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { createEvolution, toEvolutionRequest } from 'src/api/evolutions';
import {
    useBindingsEditorStore_incompatibleCollections,
    useBindingsEditorStore_setIncompatibleCollections,
} from 'src/components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { supabaseClient } from 'src/context/GlobalProviders';
import { entityHeaderButtonSx } from 'src/context/Theme';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import useStoreDiscoveredCaptures from 'src/hooks/useStoreDiscoveredCaptures';
import { logRocketEvent } from 'src/services/shared';
import {
    DEFAULT_POLLER_ERROR,
    JOB_STATUS_COLUMNS,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'src/services/supabase';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface Props {
    onFailure: (formState: Partial<FormState>) => void;
}

function SchemaEvolution({ onFailure }: Props) {
    const intl = useIntl();

    const storeDiscoveredCollections = useStoreDiscoveredCaptures();

    const { jobStatusPoller } = useJobStatusPoller();

    const entityType = useEntityType();
    const editingEntity = useEntityWorkflow_Editing();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();
    const formActive = useFormStateStore_isActive();

    const incompatibleCollections =
        useBindingsEditorStore_incompatibleCollections();

    const setIncompatibleCollections =
        useBindingsEditorStore_setIncompatibleCollections();

    const setEvolvedCollections = useBindingStore(
        (state) => state.setEvolvedCollections
    );

    const mutate_advancedEditor = useEditorStore_queryResponse_mutate();

    const jobFailed = useCallback(
        (error: any) => {
            setFormState({
                error,
                status: FormStatus.FAILED,
            });
        },
        [setFormState]
    );

    const waitForEvolutionToFinish = (
        logTokenVal: string,
        draftIdVal: string
    ) => {
        updateFormStatus(FormStatus.SCHEMA_EVOLVING);

        jobStatusPoller(
            supabaseClient
                .from(TABLES.EVOLUTIONS)
                .select(`${JOB_STATUS_COLUMNS}, collections, draft_id`)
                .match({
                    draft_id: draftIdVal,
                    logs_token: logTokenVal,
                }),
            async (payload: any) => {
                // Update the state so it knows that things came back correctly
                setFormState({
                    status: FormStatus.SCHEMA_EVOLVED,
                });

                // Treat these like discovered collections. This will mean the UI
                //  will go fetch all the new collections, specs, configs and store
                //  them locally and present them
                await storeDiscoveredCollections(
                    payload.draft_id,
                    entityType,
                    onFailure
                );

                // Now that the collections are updated we can clear out the list so
                //  the error section is no longer displayed.
                setIncompatibleCollections([]);

                // Store off so we can show users how many bindings will reversion
                setEvolvedCollections(
                    payload.job_status.evolved_collections ?? []
                );

                if (mutate_advancedEditor) {
                    await mutate_advancedEditor();
                }
            },
            async (payload: any) => {
                if (payload.error === JOB_STATUS_POLLER_ERROR) {
                    jobFailed(DEFAULT_POLLER_ERROR);
                } else {
                    jobFailed({
                        ...DEFAULT_POLLER_ERROR,
                        message: `entityEvolution.serverUnreachable`,
                    });
                }
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        updateFormStatus(FormStatus.SCHEMA_EVOLVING);

        if (draftId) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (incompatibleCollections && incompatibleCollections.length > 0) {
                const response = await createEvolution(
                    draftId,
                    incompatibleCollections.map((incompatibleCollection) =>
                        toEvolutionRequest(incompatibleCollection)
                    )
                );

                if (response.error) {
                    onFailure({
                        error: {
                            title: `entityEvolution.failure.errorTitle`,
                            error: response.error,
                        },
                    });
                } else {
                    waitForEvolutionToFinish(
                        response.data[0].logs_token,
                        draftId
                    );
                    setFormState({
                        logToken: response.data[0].logs_token,
                        showLogs: false,
                    });
                }
            }
        } else {
            logRocketEvent('Schema:Evolution:Missing draftId');
            onFailure({
                error: {
                    title: `entityCreate.errors.missingDraftId`,
                },
            });
        }
    };

    // Only show in edit mode
    if (!editingEntity) {
        return null;
    }

    return (
        <Button
            onClick={save}
            disabled={isSaving || formActive}
            sx={entityHeaderButtonSx}
        >
            {intl.formatMessage({
                id: 'cta.evolve',
            })}
        </Button>
    );
}

export default SchemaEvolution;
