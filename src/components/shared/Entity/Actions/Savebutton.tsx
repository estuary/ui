import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage, useIntl } from 'react-intl';
import { endSubscription, startSubscription, TABLES } from 'services/supabase';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';

interface Props {
    disabled: boolean;
    formId: string;
    onFailure: Function;
    dryRun?: boolean;
}

function EntityCreateSaveButton({
    disabled,
    dryRun,
    formId,
    onFailure,
}: Props) {
    const intl = useIntl();
    const supabaseClient = useClient();

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const setPubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPubId']
    >((state) => state.setPubId);

    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >((state) => state.isSaving);

    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    const useEntityCreateStore = useRouteStore();
    const entityDescription = useEntityCreateStore(
        entityCreateStoreSelectors.details.description
    );
    const setFormState = useEntityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = useEntityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );
    const formStateStatus = useEntityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const waitForPublishToFinish = (logToken: string) => {
        resetFormState(FormStatus.SAVING);
        console.log('wait for finish');
        const subscription = startSubscription(
            supabaseClient.from(
                `${TABLES.PUBLICATIONS}:draft_id=eq.${draftId}`
            ),
            async (payload: any) => {
                if (payload.logs_token === logToken) {
                    setPubId(payload.id);
                    setFormState({
                        status: FormStatus.SUCCESS,
                        exitWhenLogsClose: true,
                    });

                    showNotification({
                        description: intl.formatMessage({
                            id: `${messagePrefix}.createNotification.desc`,
                        }),
                        severity: 'success',
                        title: intl.formatMessage({
                            id: `${messagePrefix}.createNotification.title`,
                        }),
                    });

                    await endSubscription(subscription);
                }
            },
            async (payload: any) => {
                console.log('Paload', payload);
                if (payload.logs_token === logToken) {
                    console.log('wait for finish - failure');
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

        console.log('save');
        resetFormState(FormStatus.SAVING);

        console.log('save:pubstarted');
        console.log('save:creating');
        const response = await createPublication(
            draftId,
            dryRun ?? false,
            entityDescription
        );
        const publicationsSubscription = waitForPublishToFinish(
            response.data[0].logs_token
        );
        console.log('save:created', response);
        if (response.error) {
            console.log('save:created:failed', response);
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
            console.log('save:created:success', response);
            setFormState({
                logToken: response.data[0].logs_token,
                showLogs: true,
            });
        }
    };

    return (
        <Button
            onClick={save}
            disabled={disabled || isSaving || formInProgress(formStateStatus)}
            form={formId}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage
                id={dryRun === true ? 'cta.testConfig' : 'cta.saveEntity'}
            />
        </Button>
    );
}

export default EntityCreateSaveButton;
