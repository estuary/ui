import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/types';
import {
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
    useFormStateStore_showLogs,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';

interface Props {
    logEvent:
        | CustomEvents.CAPTURE_CREATE
        | CustomEvents.COLLECTION_CREATE
        | CustomEvents.MATERIALIZATION_CREATE
        | CustomEvents.CAPTURE_EDIT
        | CustomEvents.MATERIALIZATION_EDIT;
    disabled?: boolean;
    taskNames?: string[];
}

function EntitySaveButton({ disabled, taskNames, logEvent }: Props) {
    const { callFailed, closeLogs } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();

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
                    <LogDialogActions close={closeLogs} taskNames={taskNames} />
                }
            />
            <EntityCreateSave
                disabled={Boolean(disabled ?? !draftId) || !formsHydrated}
                onFailure={callFailed}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntitySaveButton;
