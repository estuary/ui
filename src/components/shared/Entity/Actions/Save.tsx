import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import {
    useEditorStore_id,
    useEditorStore_isSaving,
    useEditorStore_setPubId,
} from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import LogRocket from 'logrocket';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { DEFAULT_FILTER, jobStatusPoller, TABLES } from 'services/supabase';
import { useDetailsForm_details_description } from 'stores/DetailsForm';
import {
    FormStatus,
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';

interface Props {
    disabled: boolean;
    onFailure: Function;
    logEvent: CustomEvents;
    dryRun?: boolean;
}

const trackEvent = (logEvent: Props['logEvent'], payload: any) => {
    LogRocket.track(logEvent, {
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        dry_run: payload.dry_run ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};

function EntityCreateSave({ disabled, dryRun, onFailure, logEvent }: Props) {
    const intl = useIntl();
    const supabaseClient = useClient();

    const status = dryRun ? FormStatus.TESTING : FormStatus.SAVING;

    // Draft Editor Store
    const draftId = useEditorStore_id();

    const setPubId = useEditorStore_setPubId();

    const isSaving = useEditorStore_isSaving();

    // Details Form Store
    const entityDescription = useDetailsForm_details_description();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const setFormState = useFormStateStore_setFormState();

    const updateFormStatus = useFormStateStore_updateStatus();

    const formActive = useFormStateStore_isActive();

    // Notification Store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const waitForPublishToFinish = (
        logTokenVal: string,
        draftIdVal: string
    ) => {
        updateFormStatus(status);

        jobStatusPoller(
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .select(
                    `
                    job_status,
                    logs_token,
                    id
                `
                )
                .match({
                    draft_id: draftIdVal,
                    logs_token: logTokenVal,
                }),
            async (payload: any) => {
                const formStatus = dryRun
                    ? FormStatus.TESTED
                    : FormStatus.SAVED;

                setPubId(payload.id);
                setFormState({
                    status: formStatus,
                    exitWhenLogsClose: !dryRun,
                });

                let description, title;

                if (!dryRun) {
                    description = `${messagePrefix}.createNotification.desc`;
                    title = `${messagePrefix}.createNotification.title`;
                } else {
                    description = `${messagePrefix}.testNotification.desc`;
                    title = `${messagePrefix}.testNotification.title`;
                }

                showNotification({
                    description: intl.formatMessage({
                        id: description,
                    }),
                    severity: 'success',
                    title: intl.formatMessage({
                        id: title,
                    }),
                });

                trackEvent(logEvent, payload);
            },
            async (payload: any) => {
                trackEvent(logEvent, payload);

                onFailure({
                    error: {
                        title: `${messagePrefix}.save.failedErrorTitle`,
                    },
                });
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        updateFormStatus(status);

        if (draftId) {
            const response = await createPublication(
                draftId,
                dryRun ?? false,
                entityDescription
            );
            if (response.error) {
                onFailure({
                    error: {
                        title: `${messagePrefix}.save.failure.errorTitle`,
                        error: response.error,
                    },
                });
            } else {
                waitForPublishToFinish(response.data[0].logs_token, draftId);
                setFormState({
                    logToken: response.data[0].logs_token,
                    showLogs: true,
                });
            }
        } else {
            LogRocket.track('Entity:Create:Missing draftId');
            onFailure({
                error: {
                    title: `${messagePrefix}.save.failure.errorTitle`,
                    error: intl.formatMessage({
                        id: 'entityCreate.errors.missingDraftId',
                    }),
                },
            });
        }
    };

    return (
        <Button
            onClick={save}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage
                id={dryRun === true ? 'cta.testConfig' : 'cta.saveEntity'}
            />
        </Button>
    );
}

export default EntityCreateSave;
