import { FormattedMessage } from 'react-intl';

import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';

import { CustomEvents } from 'services/logrocket';

import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    logEvent:
        | CustomEvents.CAPTURE_CREATE
        | CustomEvents.COLLECTION_CREATE
        | CustomEvents.MATERIALIZATION_CREATE
        | CustomEvents.CAPTURE_EDIT
        | CustomEvents.MATERIALIZATION_EDIT;
    disabled?: boolean;
    materialize?: Function;
    taskNames?: string[];
}

function EntitySaveButton({
    callFailed,
    closeLogs,
    disabled,
    materialize,
    taskNames,
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
                        taskNames={taskNames}
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
                disabled={disabled ?? !draftId}
                onFailure={callFailed}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntitySaveButton;
