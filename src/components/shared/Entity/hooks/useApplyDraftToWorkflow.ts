import type { Schema } from 'src/types';

import { useCallback } from 'react';

import {
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_setSavedEndpointConfig } from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface WrittenDraft {
    draftId: string;
    catalogName: string;
    endpointConfig: Schema;
    secrets: Record<string, string> | null;
}

/**
 * Callback hook that points the workflow at a draft it just wrote, and marks
 * the form as generated.
 */
export function useApplyDraftToWorkflow() {
    const setCatalogName = useEditorStore_setCatalogName();
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    const setDraftedEntityName = useDetailsFormStore(
        (state) => state.setDraftedEntityName
    );

    const setSavedEndpointConfig =
        useEndpointConfigStore_setSavedEndpointConfig();

    const setFormState = useFormStateStore_setFormState();

    return useCallback(
        ({ draftId, catalogName, endpointConfig, secrets }: WrittenDraft) => {
            setCatalogName(catalogName);
            setSavedEndpointConfig(endpointConfig, secrets);

            setDraftId(draftId);
            setPersistedDraftId(draftId);
            setDraftedEntityName(catalogName);
            setFormState({ status: FormStatus.GENERATED });
        },
        [
            setCatalogName,
            setDraftId,
            setDraftedEntityName,
            setFormState,
            setPersistedDraftId,
            setSavedEndpointConfig,
        ]
    );
}
