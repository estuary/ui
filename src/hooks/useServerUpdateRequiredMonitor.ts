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
    findCollectionInConfigs,
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
            if (draftSpecs[0]?.spec.bindings.length === resourceConfig.length) {
                // The lengths have not changed so we need to check each binding
                return draftSpecs[0]?.spec.bindings.some(
                    (binding: any, index: number) => {
                        //Pull out resource as that is moved into `data`
                        const { resource, disable } = binding;

                        // TODO (prevents PR merge)
                        // we might not need this backup to fetch by name
                        // I think we should just stick with the index to be safer

                        // Find the config from within the configs
                        const config =
                            resourceConfig[index]?.[1] ??
                            findCollectionInConfigs(
                                getCollectionName(binding[collectionNameProp]),
                                resourceConfig
                            );

                        // Do a quick simple disabled check before comparing the entire object
                        if (
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            config?.disable !== getDisableProps(disable).disable
                        ) {
                            return true;
                        }

                        // Since we checked disabled up above we can not just check if the data changed
                        return !isEqual(
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            config?.data,
                            resource
                        );
                    }
                );
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
