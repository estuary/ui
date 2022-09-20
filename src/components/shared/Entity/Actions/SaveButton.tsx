import { useEditorStore_id } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';
import {
    FormStatus,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    logEvent:
        | CustomEvents.CAPTURE_CREATE
        | CustomEvents.MATERIALIZATION_CREATE
        | CustomEvents.CAPTURE_EDIT
        | CustomEvents.MATERIALIZATION_EDIT;
    materialize?: Function;
}

function EntitySaveButton({
    callFailed,
    closeLogs,
    disabled,
    materialize,
    logEvent,
}: Props) {
    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();

    const formStatus = useFormStateStore_status();

    return (
        <>
            <LogDialog
                open={
                    formStatus === FormStatus.SAVING ||
                    formStatus === FormStatus.SAVED
                        ? showLogs
                        : false
                }
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.save.waitMessage`}
                    />
                }
                actionComponent={
                    <LogDialogActions
                        close={closeLogs}
                        materialize={
                            materialize
                                ? {
                                      action: materialize,
                                      title: `${messagePrefix}.ctas.materialize`,
                                  }
                                : undefined
                        }
                    />
                }
            />
            <EntityCreateSave
                disabled={disabled || !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntitySaveButton;
