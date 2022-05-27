import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage, useIntl } from 'react-intl';
import { startSubscription, TABLES } from 'services/supabase';
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
}

function EntityCreateSaveButton({ disabled, formId, onFailure }: Props) {
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

    const waitForPublishToFinish = () => {
        console.log('wait for finish');
        resetFormState(FormStatus.SAVING);
        return startSubscription(
            supabaseClient.from(
                `${TABLES.PUBLICATIONS}:draft_id=eq.${draftId}`
            ),
            (payload: any) => {
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
            },
            () => {
                console.log('wait for finish - failure');
                onFailure({
                    error: { title: `${messagePrefix}.save.failedErrorTitle` },
                });
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        console.log('save');
        resetFormState(FormStatus.SAVING);
        const publicationsSubscription = waitForPublishToFinish();
        console.log('save:pubstarted');
        console.log('save:creating');
        const response = await createPublication(
            draftId,
            false,
            entityDescription
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
            <FormattedMessage id="cta.saveEntity" />
        </Button>
    );
}

export default EntityCreateSaveButton;
