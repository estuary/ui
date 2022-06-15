import { EditorStoreState } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
}

function EntityTestButton({
    callFailed,
    closeLogs,
    disabled,
    logEvent,
}: Props) {
    const useEntityCreateStore = useRouteStore();
    const showLogs = useEntityCreateStore(
        entityCreateStoreSelectors.formState.showLogs
    );
    const logToken = useEntityCreateStore(
        entityCreateStoreSelectors.formState.logToken
    );
    const formStatus = useEntityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    return (
        <>
            <LogDialog
                open={
                    (formStatus === FormStatus.TESTING ||
                        formStatus === FormStatus.TESTED) &&
                    showLogs
                }
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.test.waitMessage`}
                    />
                }
                actionComponent={<LogDialogActions close={closeLogs} />}
            />
            <EntityCreateSave
                dryRun
                disabled={disabled || !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntityTestButton;
