import { Button } from '@mui/material';
import { createEvolution } from 'api/evolutions';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import { FormattedMessage, useIntl } from 'react-intl';
import { logRocketEvent } from 'services/logrocket';
import { jobStatusPoller, JOB_STATUS_COLUMNS, TABLES } from 'services/supabase';
import {
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormState, FormStatus } from 'stores/FormState/types';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { useResourceConfig_collections } from 'stores/ResourceConfig/hooks';

interface Props {
    onFailure: (formState: Partial<FormState>) => void;
}

function SchemaEvolution({ onFailure }: Props) {
    const intl = useIntl();
    const supabaseClient = useClient();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const isSaving = useEditorStore_isSaving();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const setFormState = useFormStateStore_setFormState();

    const updateFormStatus = useFormStateStore_updateStatus();

    const formActive = useFormStateStore_isActive();

    // Notification Store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const waitForEvolutionToFinish = (
        logTokenVal: string,
        draftIdVal: string
    ) => {
        updateFormStatus(FormStatus.SCHEMA_EVOLVING);

        jobStatusPoller(
            supabaseClient
                .from(TABLES.EVOLUTIONS)
                .select(`${JOB_STATUS_COLUMNS}, collections`)
                .match({
                    draft_id: draftIdVal,
                    logs_token: logTokenVal,
                }),
            async (payload: any) => {
                setFormState({
                    status: FormStatus.SCHEMA_EVOLVED,
                });

                console.log('Evolution success', payload);

                showNotification({
                    description: intl.formatMessage({
                        id: `${messagePrefix}.testNotification.desc`,
                    }),
                    severity: 'success',
                    title: intl.formatMessage({
                        id: `${messagePrefix}.createNotification.title`,
                    }),
                });
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

    return (
        <Button onClick={save} disabled={isSaving || formActive} sx={buttonSx}>
            <FormattedMessage id="cta.evolve" />
        </Button>
    );
}

export default SchemaEvolution;
