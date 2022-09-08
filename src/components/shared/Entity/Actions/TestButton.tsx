import { useEditorStore_id } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import { EntityFormState, FormStatus } from 'stores/FormState';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    logEvent: CustomEvents.CAPTURE_TEST | CustomEvents.MATERIALIZATION_TEST;
    formStateStoreName: FormStateStoreNames;
}

function EntityTestButton({
    callFailed,
    closeLogs,
    disabled,
    logEvent,
    formStateStoreName,
}: Props) {
    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const showLogs = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['showLogs']
    >(formStateStoreName, (state) => state.formState.showLogs);

    const logToken = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['logToken']
    >(formStateStoreName, (state) => state.formState.logToken);

    const formStatus = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['status']
    >(formStateStoreName, (state) => state.formState.status);

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
                        formStateStoreName={formStateStoreName}
                    />
                }
            />
            <EntityCreateSave
                dryRun
                disabled={disabled || !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
                formStateStoreName={formStateStoreName}
            />
        </>
    );
}

export default EntityTestButton;
