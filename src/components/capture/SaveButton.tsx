import { EditorStoreState } from 'components/editor/Store';
import EntityCreateSaveButton from 'components/shared/Entity/Actions/Savebutton';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    materialize: Function;
}

function CaptureSaveButton({
    callFailed,
    closeLogs,
    disabled,
    materialize,
}: Props) {
    console.log('savebutton');
    const entityCreateStore = useRouteStore();
    const showLogs = entityCreateStore(
        entityCreateStoreSelectors.formState.showLogs
    );
    const logToken = entityCreateStore(
        entityCreateStoreSelectors.formState.logToken
    );
    const formStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const messagePrefix = entityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    return (
        <>
            <LogDialog
                open={formStatus === FormStatus.SAVING && showLogs}
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.save.waitMessage`}
                    />
                }
                actionComponent={
                    <LogDialogActions
                        close={closeLogs}
                        materialize={{
                            action: materialize,
                            title: 'captureCreate.ctas.materialize',
                        }}
                    />
                }
            />
            <EntityCreateSaveButton
                disabled={disabled || !draftId}
                onFailure={callFailed}
            />
        </>
    );
}

export default CaptureSaveButton;
