import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMemo } from 'react';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';

function useEntitySaveHelpers(disabled?: boolean) {
    const { callFailed } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();

    return useMemo(
        () => ({
            buttonDisabled: Boolean(disabled ?? !draftId) || !formsHydrated,
            formSaving: formStatus === FormStatus.SAVING,
            formTesting: formStatus === FormStatus.TESTING,
            onFailure: callFailed,
        }),
        [callFailed, disabled, draftId, formStatus, formsHydrated]
    );
}

export default useEntitySaveHelpers;
