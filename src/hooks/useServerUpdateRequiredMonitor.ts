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
} from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const entityType = useEntityType();

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
                    const { resource, disable } = binding;
                    const disableProp = getDisableProps(disable);

                    // See if anything has changed
                    return !isEqual(resourceConfig[collectionName], {
                        ...disableProp,
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
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
