import { useEditorStore_id } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import {
    EntityFormState,
    FormStatus,
    useFormStateStore_logToken,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState';

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

    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();

    const formStatus = useFormStateStore_status();

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
