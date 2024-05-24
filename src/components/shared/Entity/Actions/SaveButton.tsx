import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { CustomEvents } from 'services/types';
import { useFormStateStore_status } from 'stores/FormState/hooks';
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

function EntitySaveButton({ disabled, logEvent }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();

    const isSaving = formStatus === FormStatus.SAVING;

    return (
        <EntityCreateSave
            disabled={Boolean(disabled ?? !draftId) || !formsHydrated}
            onFailure={callFailed}
            loading={isSaving}
            logEvent={logEvent}
        />
    );
}

export default EntitySaveButton;
