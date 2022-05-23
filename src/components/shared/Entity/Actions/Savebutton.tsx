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
        resetFormState(FormStatus.SAVING);
        return startSubscription(
            supabaseClient.from(TABLES.PUBLICATIONS),
            (payload: any) => {
                setPubId(payload.new.id);
                setFormState({
                    status: FormStatus.SUCCESS,
                    exitWhenLogsClose: true,
                });

                showNotification({
                    description: intl.formatMessage({
                        id: `${messagePrefix}.captureCreate.createNotification.desc`,
                    }),
                    severity: 'success',
                    title: intl.formatMessage({
                        id: `${messagePrefix}.captureCreate.createNotification.title`,
                    }),
                });
            },
            () => {
                onFailure(`${messagePrefix}.save.failedErrorTitle`);
            }
        );
    };

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        resetFormState(FormStatus.SAVING);
        const publicationsSubscription = waitForPublishToFinish();

        const response = await createPublication(
            draftId,
            false,
            entityDescription
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
            disabled={formInProgress(formStateStatus) || disabled}
            form={formId}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage id="cta.saveEntity" />
        </Button>
    );
}

export default EntityCreateSaveButton;
