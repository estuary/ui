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

                    console.log('sup', {
                        source,
                        existingFullSource,
                        resourceConfig: resourceConfig[collectionName],
                        comparing: {
                            ...existingDisableProp,
                            fullSource: existingFullSource,
                            data: resource,
                            errors: [],
                        },
                    });

                    // TODO (enabled rediscovery)
                    // If we're enabling something then make sure we know to rediscover
                    // if (disable && !resourceConfig[collectionName].disable) {
                    //     setRediscoveryRequired(true);
                    // }

                    // See if anything has changed
                    const response = !isEqual(resourceConfig[collectionName], {
                        ...existingDisableProp,
                        fullSource: existingFullSource,
                        data: resource,
                        errors: [],
                    });

                    return response;
                });
            } else {
                // Lengths do not match so we know the update is needed
                return true;
            }
        }

        return false;
    }, [collectionNameProp, draftSpecs, resourceConfig]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
