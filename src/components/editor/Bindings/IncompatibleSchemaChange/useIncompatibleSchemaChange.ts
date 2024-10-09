import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useCallback } from 'react';

import { useBinding_currentBindingIndex } from 'stores/Binding/hooks';
import { Schema } from 'types';
import { getBindingIndex } from 'utils/workflow-utils';
import { AutoCompleteOption } from './types';

function useIncompatibleSchemaChange(
    bindingUUID: string,
    collectionName: string
) {
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const stagedBindingIndex = useBinding_currentBindingIndex();
    // const updateFullSourceConfig = useBinding_updateFullSourceConfig();

    return useCallback(
        async (
            newVal: AutoCompleteOption['val'] | undefined,
            skipServerUpdate?: boolean
        ) => {
            // Make sure we update the store so it stays in sync also in case we need to run this through generate button
            // updateFullSourceConfig(bindingUUID, formData);

            if (
                skipServerUpdate === true ||
                !mutateDraftSpecs ||
                !draftId ||
                draftSpecs.length === 0
            ) {
                // This means we are calling before a draft was made and that is okay. We'll use the values
                //      from the store while generating the spec
                return Promise.resolve();
            } else {
                const spec: Schema = draftSpecs[0].spec;

                // See which binding we need to update
                const existingBindingIndex = getBindingIndex(
                    spec.bindings,
                    collectionName,
                    stagedBindingIndex
                );

                // We only want to update existing bindings here. If they do not exist then we can just
                //  save the changes in the store and apply them when the user clicks to generate the spec
                if (existingBindingIndex > -1) {
                    if (newVal) {
                        spec.bindings[
                            existingBindingIndex
                        ].onIncompatibleSchemaChange = newVal;
                    } else {
                        delete spec.bindings[existingBindingIndex]
                            .onIncompatibleSchemaChange;
                    }

                    const updateResponse = await modifyDraftSpec(spec, {
                        draft_id: draftId,
                        catalog_name: draftSpecs[0].catalog_name,
                        spec_type: 'materialization',
                    });

                    if (updateResponse.error) {
                        return Promise.reject('update failed');
                    }

                    return mutateDraftSpecs();
                }

                // If nothing was updated we can just keep going like nothing happened
                return Promise.resolve();
            }
        },
        [
            collectionName,
            draftId,
            draftSpecs,
            mutateDraftSpecs,
            stagedBindingIndex,
        ]
    );
}

export default useIncompatibleSchemaChange;
