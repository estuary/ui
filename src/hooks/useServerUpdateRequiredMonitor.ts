import type { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
    useBinding_setServerUpdateRequired,
} from 'stores/Binding/hooks';
import { getCollectionName, getDisableProps } from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();
    const setServerUpdateRequired = useBinding_setServerUpdateRequired();
    const editing = useEntityWorkflow_Editing();

    const resourceConfigUpdated = useMemo(() => {
        if (draftSpecs.length > 0) {
            if (
                draftSpecs[0].spec.bindings.length ===
                Object.keys(resourceConfigs).length
            ) {
                // The lengths have not changed so we need to check each binding
                return Object.entries(bindings).some(
                    ([collection, bindingUUIDs]) => {
                        return bindingUUIDs.some((bindingUUID) => {
                            const expectedBindingIndex =
                                resourceConfigs[bindingUUID].meta.bindingIndex;

                            if (expectedBindingIndex > -1) {
                                const binding =
                                    draftSpecs[0].spec.bindings[
                                        expectedBindingIndex
                                    ];

                                // We might end up returning `true` here but adding this logging
                                //  to get more information before making that change.
                                if (!binding) {
                                    logRocketEvent(
                                        CustomEvents.BINDINGS_EXPECTED_MISSING,
                                        {
                                            collection,
                                            expectedBindingIndex,
                                        }
                                    );
                                }

                                // Ensure the associated collection matches before comparing binding properties.
                                if (collection !== getCollectionName(binding)) {
                                    return true;
                                }

                                // Do a quick simple disabled check before comparing the entire object
                                if (
                                    resourceConfigs[bindingUUID].meta
                                        .disable !==
                                    getDisableProps(binding?.disable).disable
                                ) {
                                    return true;
                                }

                                // Since we checked disabled up above we can not just check if the data changed
                                return !isEqual(
                                    resourceConfigs[bindingUUID].data,
                                    binding?.resource
                                );
                            }

                            return true;
                        });
                    }
                );
            } else {
                // Lengths do not match so we know the update is needed
                return true;
            }
        }

        return !editing;
    }, [bindings, draftSpecs, editing, resourceConfigs]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
