import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
    useBinding_bindings,
    useBinding_resourceConfigs,
    useBinding_setServerUpdateRequired,
} from 'stores/Binding/hooks';
import { Bindings } from 'stores/Binding/types';
import { hasLength } from 'utils/misc-utils';
import {
    getCollectionName,
    getCollectionNameProp,
    getDisableProps,
} from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const entityType = useEntityType();

    const bindings = useBinding_bindings();
    const resourceConfigs = useBinding_resourceConfigs();
    const setServerUpdateRequired = useBinding_setServerUpdateRequired();

    const collectionNameProp = useMemo(
        () => getCollectionNameProp(entityType),
        [entityType]
    );

    const resourceConfigUpdated = useMemo(() => {
        if (hasLength(draftSpecs)) {
            if (
                draftSpecs[0]?.spec.bindings.length ===
                Object.keys(resourceConfigs).length
            ) {
                const matchedBindings: Bindings = {};

                // The lengths have not changed so we need to check each binding
                return draftSpecs[0]?.spec.bindings.some((binding: any) => {
                    // Pull out resource as that is moved into `data`
                    const { resource, disable } = binding;

                    // Snag the name so we know which resource config to check
                    const collectionName = getCollectionName(
                        binding[collectionNameProp]
                    );

                    // If a binding with a given source collection does not exist, an update is needed.
                    if (!Object.hasOwn(bindings, collectionName)) {
                        return true;
                    }

                    const matchedBindingUUIDs: string[] = Object.hasOwn(
                        matchedBindings,
                        collectionName
                    )
                        ? matchedBindings[collectionName]
                        : [];

                    return bindings[collectionName]
                        .filter(
                            (bindingUUID) =>
                                !matchedBindingUUIDs.includes(bindingUUID)
                        )
                        .every((bindingUUID) => {
                            // Do a quick simple disabled check before comparing the entire object
                            if (
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                resourceConfigs[bindingUUID]?.meta?.disable !==
                                getDisableProps(disable).disable
                            ) {
                                return true;
                            }

                            // Since we checked disabled up above we can not just check if the data changed
                            const resourceMatched = isEqual(
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                resourceConfigs[bindingUUID]?.data,
                                resource
                            );

                            if (resourceMatched) {
                                matchedBindings[collectionName] =
                                    matchedBindingUUIDs.concat(bindingUUID);
                            }

                            return !resourceMatched;
                        });
                });
            } else {
                // Lengths do not match so we know the update is needed
                return true;
            }
        }

        return false;
    }, [bindings, collectionNameProp, draftSpecs, resourceConfigs]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
