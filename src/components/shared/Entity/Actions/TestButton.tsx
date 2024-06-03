import { useEditorStore_id } from 'components/editor/Store/hooks';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';
import { EntityTestButtonProps } from './types';

function EntityTestButton({ disabled, logEvent }: EntityTestButtonProps) {
    const { callFailed } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Form State Store
    const formStatus = useFormStateStore_status();

    return (
        <EntityCreateSave
            dryRun
            disabled={Boolean(disabled || !draftId) || !formsHydrated}
            onFailure={callFailed}
            loading={formStatus === FormStatus.TESTING}
            logEvent={logEvent}
        />
    );
}

export default EntityTestButton;
