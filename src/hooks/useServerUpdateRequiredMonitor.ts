import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
    useBinding_setServerUpdateRequired,
} from 'stores/Binding/hooks';
import { getBindingIndex, getDisableProps } from 'utils/workflow-utils';

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
                            const targetBindingIndex = Object.hasOwn(
                                bindings,
                                collection
                            )
                                ? bindings[collection].findIndex(
                                      (uuid) => uuid === bindingUUID
                                  )
                                : -1;

                            const existingBindingIndex = getBindingIndex(
                                draftSpecs[0]?.spec.bindings,
                                collection,
                                targetBindingIndex
                            );

                            if (existingBindingIndex > -1) {
                                const { resource, disable } =
                                    draftSpecs[0].spec.bindings[
                                        existingBindingIndex
                                    ];

                                // Do a quick simple disabled check before comparing the entire object
                                if (
                                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                    resourceConfigs[bindingUUID]?.meta
                                        .disable !==
                                    getDisableProps(disable).disable
                                ) {
                                    return true;
                                }

                                // Since we checked disabled up above we can not just check if the data changed
                                return !isEqual(
                                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                    resourceConfigs[bindingUUID]?.data,
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
