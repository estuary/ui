import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { hasLength } from 'utils/misc-utils';
import { getCollectionName, getCollectionNameProp } from 'utils/workflow-utils';

const useServerUpdateRequiredMonitor = (draftSpecs: DraftSpecQuery[]) => {
    const entityType = useEntityType();

    const resourceConfig = useResourceConfig_resourceConfig();
    const setServerUpdateRequired = useResourceConfig_setServerUpdateRequired();

    const collectionNameProp = useMemo(
        () => getCollectionNameProp(entityType),
        [entityType]
    );

    const resourceConfigUpdated = useMemo(
        () =>
            hasLength(draftSpecs)
                ? draftSpecs[0]?.spec.bindings.some((binding: any) => {
                      // Snag the name so we know which resource config to check
                      const collectionName = getCollectionName(
                          binding[collectionNameProp]
                      );

                      //Pull out resource as that is moved into `data`
                      const { resource, ...restOfBinding } = binding;

                      // See if anything has changed
                      return !isEqual(resourceConfig[collectionName], {
                          ...restOfBinding,
                          data: resource,
                          errors: [],
                      });
                  })
                : false,
        [collectionNameProp, draftSpecs, resourceConfig]
    );

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);
};

export { useServerUpdateRequiredMonitor };
