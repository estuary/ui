import type { Schema } from 'src/types';

import { useCallback } from 'react';

import {
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface WrittenDraft {
    draftId: string;
    catalogName: string;
    encryptedEndpointConfig: Schema;
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

    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const setFormState = useFormStateStore_setFormState();

    return useCallback(
        ({ draftId, catalogName, encryptedEndpointConfig }: WrittenDraft) => {
            setCatalogName(catalogName);
            setEncryptedEndpointConfig({ data: encryptedEndpointConfig });
            setPreviousEndpointConfig({ data: endpointConfigData });

            setDraftId(draftId);
            setPersistedDraftId(draftId);
            setDraftedEntityName(catalogName);
            setFormState({ status: FormStatus.GENERATED });
        },
        [
            endpointConfigData,
            setCatalogName,
            setDraftId,
            setDraftedEntityName,
            setEncryptedEndpointConfig,
            setFormState,
            setPersistedDraftId,
            setPreviousEndpointConfig,
        ]
    );
}
