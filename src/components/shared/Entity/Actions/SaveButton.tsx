import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
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
import LogDialog from '../LogDialog';
import LogDialogActions from '../LogDialogActions';

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

function EntitySaveButton({ logEvent, disabled, taskNames }: Props) {
    const { callFailed, closeLogs } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();

    const messagePrefix = useFormStateStore_messagePrefix();
    const showLogs = useFormStateStore_showLogs();
    const logToken = useFormStateStore_logToken();
    const formStatus = useFormStateStore_status();

    const isSaving = formStatus === FormStatus.SAVING;

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
                loading={isSaving}
                logEvent={logEvent}
            />
        </>
    );
}

export default EntitySaveButton;
