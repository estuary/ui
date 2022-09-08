import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import {
    EditorStoreState,
    useEditorStore_id,
    useEditorStore_setPubId,
} from 'components/editor/Store';
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
import { endSubscription, startSubscription, TABLES } from 'services/supabase';
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
        id: payload.id,
        draft_id: payload.draft_id,
        dry_run: payload.dry_run,
        logs_token: payload.logs_token,
        status: payload.job_status.type,
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
    const draftId = useEditorStore_id();

    const setPubId = useEditorStore_setPubId();

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

    const waitForPublishToFinish = (logTokenVal: string) => {
        resetFormState(status);
        const subscription = startSubscription(
            supabaseClient.from(
                `${TABLES.PUBLICATIONS}:draft_id=eq.${draftId}`
            ),
            async (payload: any) => {
                if (payload.logs_token === logTokenVal) {
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

                    await endSubscription(subscription);
                }
            },
            async (payload: any) => {
                if (payload.logs_token === logTokenVal) {
                    trackEvent(logEvent, payload);

                    onFailure({
                        error: {
                            title: `${messagePrefix}.save.failedErrorTitle`,
                        },
                    });

                    await endSubscription(subscription);
                }
            },
            true
        );

        return subscription;
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        resetFormState(status);

        const response = await createPublication(
            draftId,
            dryRun ?? false,
            entityDescription
        );
        const publicationsSubscription = waitForPublishToFinish(
            response.data[0].logs_token
        );
        if (response.error) {
            onFailure(
                {
                    error: {
                        title: `${messagePrefix}.save.failure.errorTitle`,
                        error: response.error,
                    },
                },
                publicationsSubscription
            );
        } else {
            setFormState({
                logToken: response.data[0].logs_token,
                showLogs: true,
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
