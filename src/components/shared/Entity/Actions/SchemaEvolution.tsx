import { Button } from '@mui/material';
import { createEvolution } from 'api/evolutions';
import {
    useBindingsEditorStore_incompatibleCollections,
    useBindingsEditorStore_setIncompatibleCollections,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useClient } from 'hooks/supabase-swr';
import useStoreDiscoveredCaptures from 'hooks/useStoreDiscoveredCaptures';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'services/logrocket';
import {
    DEFAULT_POLLER_ERROR,
    jobStatusPoller,
    JOB_STATUS_COLUMNS,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'services/supabase';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormState, FormStatus } from 'stores/FormState/types';

interface Props {
    onFailure: (formState: Partial<FormState>) => void;
}

function SchemaEvolution({ onFailure }: Props) {
    const supabaseClient = useClient();
    const storeDiscoveredCollections = useStoreDiscoveredCaptures();

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

    const jobFailed = useCallback(
        (error) => {
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
                    incompatibleCollections.map(
                        (incompatibleCollection) =>
                            incompatibleCollection.collection
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

    // Only show in edit mode and for captures
    if (!editingEntity || entityType !== 'capture') {
        return null;
    }
    return (
        <Button onClick={save} disabled={isSaving || formActive} sx={buttonSx}>
            <FormattedMessage id="cta.evolve" />
        </Button>
    );
}

export default SchemaEvolution;
