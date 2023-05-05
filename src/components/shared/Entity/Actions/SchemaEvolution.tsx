import { Button } from '@mui/material';
import { createEvolution } from 'api/evolutions';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { useClient } from 'hooks/supabase-swr';
import useStoreDiscoveredCaptures from 'hooks/useStoreDiscoveredCaptures';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'services/logrocket';
import { jobStatusPoller, JOB_STATUS_COLUMNS, TABLES } from 'services/supabase';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormState, FormStatus } from 'stores/FormState/types';
import { useResourceConfig_collections } from 'stores/ResourceConfig/hooks';

interface Props {
    onFailure: (formState: Partial<FormState>) => void;
}

function SchemaEvolution({ onFailure }: Props) {
    const supabaseClient = useClient();

    const entityType = useEntityType();
    const editingEntity = useEntityWorkflow_Editing();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const storeDiscoveredCollections = useStoreDiscoveredCaptures();

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
                setFormState({
                    status: FormStatus.SCHEMA_EVOLVED,
                });

                console.log(
                    'Evolution success',
                    payload.job_status.evolvedCollections
                );

                // TODO - run through all the collections and update the name in the store?
                await storeDiscoveredCollections(
                    payload.draft_id,
                    entityType,
                    onFailure
                );
            },
            async (payload: any) => {
                onFailure({
                    error: {
                        title: payload?.job_status?.error ?? null,
                    },
                });
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        updateFormStatus(FormStatus.SCHEMA_EVOLVING);

        if (draftId) {
            if (collections && collections.length > 0) {
                // Inset the evolution details
                // TODO: need logic to update collections
                const response = await createEvolution(draftId, collections);
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
            logRocketEvent('Entity:Create:Missing draftId');
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
