import { EditorStoreState } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { entityCreateStoreSelectors } from 'stores/Create';
import { CreateState, FormStatus } from 'stores/MiniCreate';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
    draftEditorStoreName: DraftEditorStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function EntityTestButton({
    callFailed,
    closeLogs,
    disabled,
    logEvent,
    draftEditorStoreName,
    detailsFormStoreName,
}: Props) {
    const useEntityCreateStore = useRouteStore();
    const showLogs = useZustandStore<
        CreateState,
        CreateState['formState']['showLogs']
    >(detailsFormStoreName, (state) => state.formState.showLogs);

    const logToken = useZustandStore<
        CreateState,
        CreateState['formState']['logToken']
    >(detailsFormStoreName, (state) => state.formState.logToken);

    const formStatus = useZustandStore<
        CreateState,
        CreateState['formState']['status']
    >(detailsFormStoreName, (state) => state.formState.status);

    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    return (
        <>
            <LogDialog
                open={
                    formStatus === FormStatus.TESTING ||
                    formStatus === FormStatus.TESTED
                        ? showLogs
                        : false
                }
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.test.waitMessage`}
                    />
                }
                actionComponent={
                    <LogDialogActions
                        close={closeLogs}
                        detailsFormStoreName={detailsFormStoreName}
                    />
                }
            />
            <EntityCreateSave
                dryRun
                disabled={disabled || !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
                draftEditorStoreName={draftEditorStoreName}
                detailsFormStoreName={detailsFormStoreName}
            />
        </>
    );
}

export default EntityTestButton;
