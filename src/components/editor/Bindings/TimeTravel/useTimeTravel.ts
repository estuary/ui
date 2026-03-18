import type { FullSourceJsonForms } from 'src/stores/Binding/slices/TimeTravel';
import type { Schema } from 'src/types';

import { useCallback, useMemo } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import {
    useBinding_currentBindingIndex,
    useBinding_fullSourceOfBinding,
    useBinding_updateFullSourceConfig,
} from 'src/stores/Binding/hooks';
import {
    getBindingIndex,
    getCollectionNameProp,
    getFullSourceSetting,
} from 'src/utils/workflow-utils';

function useTimeTravel(bindingUUID: string, collectionName: string) {
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const stagedBindingIndex = useBinding_currentBindingIndex();
    const updateFullSourceConfig = useBinding_updateFullSourceConfig();

    const updateTimeTravel = useCallback(
        async (formData: FullSourceJsonForms, skipServerUpdate?: boolean) => {
            // Make sure we update the store so it stays in sync also in case we need to run this through generate button
            updateFullSourceConfig(bindingUUID, formData);

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
                const collectionNameProp =
                    getCollectionNameProp('materialization');
                const spec: Schema = cloneDeep(draftSpecs[0].spec);

                // See which binding we need to update
                const existingBindingIndex = getBindingIndex(
                    spec.bindings,
                    collectionName,
                    stagedBindingIndex
                );

                // We only want to update existing bindings here. If they do not exist then we can just
                //  save the changes in the store and apply them when the user clicks to generate the spec
                if (existingBindingIndex > -1) {
                    const noMergingNeeded =
                        typeof spec.bindings[existingBindingIndex][
                            collectionNameProp
                        ] === 'string';

                    spec.bindings[existingBindingIndex][collectionNameProp] =
                        getFullSourceSetting(
                            noMergingNeeded
                                ? { [bindingUUID]: { data: formData.data } }
                                : {
                                      [bindingUUID]: {
                                          ...spec.bindings[
                                              existingBindingIndex
                                          ][collectionNameProp],
                                          ...{ data: formData.data },
                                      },
                                  },
                            collectionName,
                            bindingUUID
                        );

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
            bindingUUID,
            collectionName,
            draftId,
            draftSpecs,
            mutateDraftSpecs,
            stagedBindingIndex,
            updateFullSourceConfig,
        ]
    );

    const fullSource = useBinding_fullSourceOfBinding(bindingUUID);

    return useMemo(
        () => ({ updateTimeTravel, fullSource }),
        [fullSource, updateTimeTravel]
    );
}

export default useTimeTravel;
