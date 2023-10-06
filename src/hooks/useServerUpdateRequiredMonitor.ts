import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';
import {
    getCollectionName,
    getCollectionNameProp,
    getDisableProps,
    getFullSource,
} from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const entityType = useEntityType();

    // TODO (enabled rediscovery)
    // Need to fetch if we're in edit or not

    const resourceConfig = useResourceConfig_resourceConfig();
    const setServerUpdateRequired = useResourceConfig_setServerUpdateRequired();

    const collectionNameProp = useMemo(
        () => getCollectionNameProp(entityType),
        [entityType]
    );

    const resourceConfigUpdated = useMemo(() => {
        if (hasLength(draftSpecs)) {
            if (
                draftSpecs[0]?.spec.bindings.length ===
                Object.keys(resourceConfig).length
            ) {
                // The lengths have not changed so we need to check each binding
                return draftSpecs[0]?.spec.bindings.some((binding: any) => {
                    // Snag the name so we know which resource config to check
                    const collectionName = getCollectionName(
                        binding[collectionNameProp]
                    );

                    //Pull out resource as that is moved into `data`
                    const { resource, disable, source } = binding;
                    const existingDisableProp = getDisableProps(disable);
                    const existingFullSource = getFullSource(
                        source,
                        true,
                        true
                    );

                    // TODO (enabled rediscovery)
                    // If we're enabling something then make sure we know to rediscover
                    // if (disable && !resourceConfig[collectionName].disable) {
                    //     setRediscoveryRequired(true);
                    // }

                    // First check if disabled has changed cause it is a simple boolean
                    if (
                        existingDisableProp.disable !==
                        resourceConfig[collectionName].disable
                    ) {
                        return true;
                    }

                    // TODO (draft updates)
                    // Since we are marking some items for clean up we need to fetched the
                    //      "cleaned up" version to compare but not actually mess with our local copy.
                    // This is messy and very hacky and something we need to fix by just updating
                    //      the draft directly.
                    let filteredNew;
                    if (resourceConfig[collectionName].fullSource) {
                        filteredNew = {
                            ...resourceConfig[collectionName],
                            ...getFullSource(
                                resourceConfig[collectionName].fullSource,
                                false,
                                true
                            ),
                        };
                    } else {
                        filteredNew = resourceConfig[collectionName];
                    }

                    // See if anything has changed
                    return !isEqual(filteredNew, {
                        ...existingDisableProp,
                        ...existingFullSource,
                        data: resource,
                        errors: [],
                    });
                });
            } else {
                // Lengths do not match so we know the update is needed
                return true;
            }
        }

        return false;
    }, [collectionNameProp, draftSpecs, resourceConfig]);

    useEffect(() => {
        console.log('use effect being called', resourceConfigUpdated);
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
