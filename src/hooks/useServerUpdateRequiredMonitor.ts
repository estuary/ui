import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
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

                                const { resource, disable } = binding;

                                // Ensure the associated collection matches before comparing binding properties.
                                if (collection !== getCollectionName(binding)) {
                                    return true;
                                }

                                // Do a quick simple disabled check before comparing the entire object
                                if (
                                    resourceConfigs[bindingUUID].meta
                                        .disable !==
                                    getDisableProps(disable).disable
                                ) {
                                    return true;
                                }

                                // Since we checked disabled up above we can not just check if the data changed
                                return !isEqual(
                                    resourceConfigs[bindingUUID].data,
                                    resource
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

        return false;
    }, [bindings, draftSpecs, resourceConfigs]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
