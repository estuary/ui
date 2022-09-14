import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useClient } from 'hooks/supabase-swr';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import LogRocket from 'logrocket';
import { FormattedMessage, useIntl } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { DEFAULT_FILTER, jobStatusPoller, TABLES } from 'services/supabase';
import { useDetailsForm_details_description } from 'stores/DetailsForm';
import { EntityFormState, FormStatus } from 'stores/FormState';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';

interface Props {
    disabled: boolean;
    onFailure: Function;
    logEvent: CustomEvents;
    dryRun?: boolean;
    draftEditorStoreName: DraftEditorStoreNames;
    formStateStoreName: FormStateStoreNames;
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

function EntityCreateSave({
    disabled,
    dryRun,
    onFailure,
    draftEditorStoreName,
    logEvent,
    formStateStoreName,
}: Props) {
    const intl = useIntl();
    const supabaseClient = useClient();

    const status = dryRun ? FormStatus.TESTING : FormStatus.SAVING;

    // Draft Editor Store
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    const setPubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPubId']
    >(draftEditorStoreName, (state) => state.setPubId);

    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

    // Details Form Store
    const entityDescription = useDetailsForm_details_description();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const setFormState = useZustandStore<
        EntityFormState,
        EntityFormState['setFormState']
    >(formStateStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        EntityFormState,
        EntityFormState['resetFormState']
    >(formStateStoreName, (state) => state.resetFormState);

    const formActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    // Notification Store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const waitForPublishToFinish = (
        logTokenVal: string,
        draftIdVal: string
    ) => {
        resetFormState(status);

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

        resetFormState(status);

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
            LogRocket.log('Entity : Create : Missing draftId');
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
