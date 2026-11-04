import type { WrittenDraft } from 'src/components/shared/Entity/types';
import type { Schema } from 'src/types';

import { useCallback } from 'react';

import {
    useEditorStore_setCatalogName,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useMutateDraftSpec } from 'src/components/shared/Entity/MutateDraftSpecContext';
import { useEntityType } from 'src/context/EntityContext';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import {
    useBinding_prefillBindingDependentState,
    useBinding_resetRediscoverySettings,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { getEndpointFromSpecDef } from 'src/utils/connector-utils';

/**
 * Callback hook that points the workflow at a draft it just wrote, and marks
 * the form as generated once the draft is reloaded.
 */
export function useApplyDraftToWorkflow() {
    const entityType = useEntityType();
    const mutateDraftSpec = useMutateDraftSpec();

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

    const prefillBindingDependentState =
        useBinding_prefillBindingDependentState();
    const resetRediscoverySettings = useBinding_resetRediscoverySettings();
    const resetResourceConfigAddedMetadata = useBindingStore(
        (state) => state.resetResourceConfigAddedMetadata
    );

    return useCallback(
        async (draft: WrittenDraft, requestFieldValidation?: boolean) => {
            const isMaterialization = entityType === 'materialization';
            const { draftId, catalogName, specDef } = draft;

            if (isMaterialization) {
                // This needs to be called before mutate is called so that the
                //  useServerUpdateRequireMonitor hook is not called more than
                //  it needs to be. This is important because once the mutate is called
                //  that changes the draft spec object and that triggers the hook.
                prefillBindingDependentState(
                    'materialization',
                    [],
                    specDef.bindings,
                    true,
                    requestFieldValidation
                );
                // Mutate the draft first so that we are not running
                // update after the form is showing as "done"
                await mutateDraftSpec();
                resetResourceConfigAddedMetadata();
            } else {
                // TODO: Currently captures don't wait for the mutate before
                // showing the form as done. Determine if this is the right behavior
                // going forward or should be fixed.
                void mutateDraftSpec();
            }

            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: draftId,
                component: 'useApplyDraftToWorkflow',
            });

            setCatalogName(catalogName);
            setEncryptedEndpointConfig({
                data: getEndpointFromSpecDef(specDef)?.config as Schema,
            });
            setPreviousEndpointConfig({ data: endpointConfigData });

            setDraftId(draftId);
            setPersistedDraftId(draftId);
            setDraftedEntityName(catalogName);
            setFormState({ status: FormStatus.GENERATED });

            if (isMaterialization) {
                // Materializations do not use this setting but still letting it get populated to keep
                //  the stores simpler. Also, I could easily see us needing to know what collections
                //  were enabled during an edit in materializations.
                resetRediscoverySettings();
            }
        },
        [
            endpointConfigData,
            entityType,
            mutateDraftSpec,
            prefillBindingDependentState,
            resetRediscoverySettings,
            resetResourceConfigAddedMetadata,
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
