import { Button } from '@mui/material';
import { createPublication } from 'api/publications';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    disabled: boolean;
    onFailure: Function;
    subscription: Function;
}

function CaptureSaveButton({ disabled, onFailure, subscription }: Props) {
    const entityCreateStore = useRouteStore();
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const entityDescription = entityCreateStore(
        entityCreateStoreSelectors.details.description
    );

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setFormState({
            status: FormStatus.SAVING,
        });

        const publicationsSubscription = subscription();
        const response = await createPublication(draftId, entityDescription);

        if (response.error) {
            onFailure(
                {
                    error: {
                        title: 'captureCreation.save.failedErrorTitle',
                        error: response.error,
                    },
                },
                publicationsSubscription
            );
        }

        setFormState({
            logToken: response.data[0].logs_token,
            showLogs: true,
        });
    };

    return (
        <Button onClick={save} disabled={disabled} sx={buttonSx}>
            <FormattedMessage id="cta.saveEntity" />
        </Button>
    );
}

export default CaptureSaveButton;
