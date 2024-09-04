import { useEditorStore_id } from 'components/editor/Store/hooks';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMemo } from 'react';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import useEntityWorkflowHydrated from '../hooks/useEntityWorkflowHydrated';

function useEntitySaveHelpers(disabled?: boolean) {
    const { callFailed } = useEntityWorkflowHelpers();
    const formsHydrated = useEntityWorkflowHydrated();

    const draftId = useEditorStore_id();
    // const isSaving = useEditorStore_isSaving();
    // const formActive = useFormStateStore_isActive();

    const formStatus = useFormStateStore_status();

    return useMemo(
        () => ({
            buttonDisabled: Boolean(disabled ?? !draftId) || !formsHydrated,
            formSaving: formStatus === FormStatus.SAVING,
            onFailure: callFailed,
        }),
        [callFailed, disabled, draftId, formStatus, formsHydrated]
    );
}

export default useEntitySaveHelpers;
