import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useCallback } from 'react';

import { Schema } from 'types';
import {
    getCollectionName,
    getCollectionNameProp,
    getFullSource,
} from 'utils/workflow-utils';
import { useBindingsEditorStore_updateFullSourceConfig } from '../../Store/hooks';
import { FullSource } from '../../Store/types';

function useTimeTravel(collectionName: string) {
    // Draft Editor Store
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

                // We set non-dates to null so here we see
                const onlyHasName =
                    !fullSource.notAfter && !fullSource.notBefore;

                const newNameValue = onlyHasName
                    ? collectionName
                    : {
                          ...fullSource,
                          name: collectionName,
                      };

                // See which binding we need to update
                const existingBindingIndex = spec.bindings.findIndex(
                    (binding: any) =>
                        getCollectionName(binding) === collectionName
                );

                if (existingBindingIndex > -1) {
                    // Grab the existing name so we know if it is a name or fullSource
                    const existingNameValue =
                        spec.bindings[existingBindingIndex][collectionNameProp];

                    if (typeof newNameValue === 'string') {
                        // There is no new fullSource props so switch back to just a string for the name
                        spec.bindings[existingBindingIndex][
                            collectionNameProp
                        ] = newNameValue;
                    } else {
                        const noExistingFullSource =
                            typeof existingNameValue === 'string';

                        if (noExistingFullSource) {
                            // We can safely just set the props we have as we won't override anything existing
                            spec.bindings[existingBindingIndex][
                                collectionNameProp
                            ] = newNameValue;
                        } else {
                            // We want to filter out nulls but only AFTER merging with existing
                            const filteredOutNullValues = getFullSource(
                                { ...existingNameValue, ...newNameValue },
                                false,
                                true
                            );

                            // Make sure we start with the existing so only new props override
                            spec.bindings[existingBindingIndex][
                                collectionNameProp
                            ] = filteredOutNullValues.fullSource;
                        }
                    }

                    // spec.bindings[existingBindingIndex].resource = {
                    //     ...resourceConfig,
                    // };
                }
                // else if (Object.keys(resourceConfig).length > 0) {
                //     spec.bindings.push({
                //         [collectionNameProp]: newNameValue,
                //         resource: {
                //             ...resourceConfig,
                //         },
                //     });
                // }

                const updateResponse = await modifyDraftSpec(spec, {
                    draft_id: draftId,
                    catalog_name: draftSpecs[0].catalog_name,
                    spec_type: 'materialization',
                });

                if (updateResponse.error) {
                    return Promise.reject();
                }

                return mutateDraftSpecs();
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

    return updateTimeTravel;
}

export default useTimeTravel;
