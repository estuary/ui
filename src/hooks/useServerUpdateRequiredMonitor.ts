import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { hasLength } from 'utils/misc-utils';
import { getCollectionName, getCollectionNameProp } from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const entityType = useEntityType();

    const resourceConfig = useResourceConfig_resourceConfig();
    const setServerUpdateRequired = useResourceConfig_setServerUpdateRequired();

    const resourceConfigUpdated = useMemo(() => {
        if (hasLength(draftSpecs)) {
            let queriedResourceConfig: ResourceConfigDictionary = {};

            const collectionNameProp = getCollectionNameProp(entityType);

            draftSpecs[0]?.spec.bindings.forEach((binding: any) => {
                // Remove the resource as we need to use that to populate the json forms data
                //  the rest should still be added
                const { resource, ...restOfBindings } = binding;
                const newValue = {
                    ...restOfBindings,
                    data: resource,
                    errors: [],
                };
                queriedResourceConfig = {
                    ...queriedResourceConfig,
                    [getCollectionName(binding[collectionNameProp])]: newValue,
                };
            });

            return !isEqual(resourceConfig, queriedResourceConfig);
        }

        return false;
    }, [draftSpecs, entityType, resourceConfig]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
