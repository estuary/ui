import { Button } from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { useClient } from 'hooks/supabase-swr';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { TABLES } from 'services/supabase';
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

function MaterializeSaveButton({
    disabled,
    formId,
    onFailure,
    subscription,
}: Props) {
    // Supabase
    const supabaseClient = useClient();

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const entityCreateStore = useRouteStore();
    const entityDescription = entityCreateStore(
        entityCreateStoreSelectors.details.description
    );
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    const save = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        resetFormState(FormStatus.SAVING);
        const publicationsSubscription = subscription();

        supabaseClient
            .from(TABLES.PUBLICATIONS)
            .insert([
                {
                    draft_id: draftId,
                    dry_run: false,
                    detail: entityDescription ?? null,
                },
            ])
            .then(
                async (response) => {
                    if (response.data) {
                        if (response.data.length > 0) {
                            setFormState({
                                logToken: response.data[0].logs_token,
                                showLogs: true,
                            });
                        }
                    } else {
                        onFailure(
                            {
                                error: {
                                    title: 'materializationCreation.save.failure.errorTitle',
                                    error: response.error,
                                },
                            },
                            publicationsSubscription
                        );
                    }
                },
                () => {
                    onFailure(
                        {
                            error: {
                                title: 'materializationCreation.save.serverUnreachable',
                            },
                        },
                        publicationsSubscription
                    );
                }
            );
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

export default MaterializeSaveButton;
