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
                    //Pull out resource as that is moved into `data`
                    const { resource, disable } = binding;

                    // Snag the name so we know which resource config to check
                    const collectionName = getCollectionName(
                        binding[collectionNameProp]
                    );

                    // If the collection is no longer there then we are probably applying a schema evolution so we
                    //      should not require server update as we just got back from the server
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (!resourceConfig[collectionName]?.data) {
                        return false;
                    }

                    // Do a quick simple disabled check before comparing the entire object
                    if (
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        resourceConfig[collectionName]?.disable !==
                        getDisableProps(disable).disable
                    ) {
                        return true;
                    }

                    // Since we checked disabled up above we can not just check if the data changed
                    return !isEqual(
                        resourceConfig[collectionName].data,
                        resource
                    );
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
