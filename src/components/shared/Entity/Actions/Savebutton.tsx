import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';

interface Props {
    disabled: boolean;
    formId: string;
    onFailure: Function;
    subscription: Function;
}

function EntityCreateSaveButton({
    disabled,
    formId,
    onFailure,
    subscription,
}: Props) {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const entityCreateStore = useRouteStore();
    const entityDescription = entityCreateStore(
        entityCreateStoreSelectors.details.description
    );
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const messagePrefix = entityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        resetFormState(FormStatus.SAVING);
        const publicationsSubscription = subscription(false);

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
