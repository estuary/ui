import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';
import { EntitySaveButtonProps } from './types';

function EntitySaveButton({ logEvent, disabled }: EntitySaveButtonProps) {
    const { callFailed } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();

    return (
        <EntityCreateSave
            disabled={Boolean(disabled ?? !draftId) || !formsHydrated}
            onFailure={callFailed}
            loading={formStatus === FormStatus.SAVING}
            logEvent={logEvent}
        />
    );
}

export default EntitySaveButton;
