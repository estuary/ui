import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useCallback, useMemo } from 'react';

import { Schema } from 'types';
import {
    getCollectionName,
    getCollectionNameProp,
    getFullSourceSetting,
} from 'utils/workflow-utils';
import {
    useBindingsEditorStore_fullSourceOfCollection,
    useBindingsEditorStore_updateFullSourceConfig,
} from '../Store/hooks';
import { FullSource } from '../Store/types';

function useTimeTravel(collectionName: string) {
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateFullSourceConfig =
        useBindingsEditorStore_updateFullSourceConfig();

    const updateTimeTravel = useCallback(
        async (fullSource: FullSource) => {
            // Make sure we update the store so it stays in sync also in case we need to run this through generate button
            updateFullSourceConfig(collectionName, fullSource);

            if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
                return Promise.reject();
            } else {
                const collectionNameProp =
                    getCollectionNameProp('materialization');
                const spec: Schema = draftSpecs[0].spec;

                // See which binding we need to update
                const existingBindingIndex = spec.bindings.findIndex(
                    (binding: any) =>
                        getCollectionName(binding) === collectionName
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
                                ? { [collectionName]: fullSource }
                                : {
                                      [collectionName]: {
                                          ...spec.bindings[
                                              existingBindingIndex
                                          ][collectionNameProp],
                                          ...fullSource,
                                      },
                                  },
                            collectionName
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
            collectionName,
            draftId,
            draftSpecs,
            mutateDraftSpecs,
            updateFullSourceConfig,
        ]
    );

    const fullSource =
        useBindingsEditorStore_fullSourceOfCollection(collectionName);

    return useMemo(
        () => ({ updateTimeTravel, fullSource }),
        [fullSource, updateTimeTravel]
    );
}

export default useTimeTravel;
