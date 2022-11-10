import { generateCaptureDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { hasLength } from 'utils/misc-utils';

const mergeResourceConfigs = (
    queryData: DraftSpecQuery,
    resourceConfig: ResourceConfigDictionary,
    restrictedDiscoveredCollections: string[]
): ResourceConfigDictionary => {
    const existingCollections = Object.keys(resourceConfig);
    const mergedResourceConfig = {};

    Object.entries(resourceConfig).forEach(([key, value]) => {
        mergedResourceConfig[key] = value;
    });

    queryData.spec.bindings.forEach((binding: any) => {
        if (
            !existingCollections.includes(binding.target) &&
            !restrictedDiscoveredCollections.includes(binding.target)
        ) {
            mergedResourceConfig[binding.target] = {
                data: binding.resource,
                errors: [],
            };
        }
    });

    return mergedResourceConfig;
};

export const modifyDiscoveredDraftSpec = async (
    response: {
        data: DraftSpecQuery[];
        error?: undefined;
    },
    resourceConfig: ResourceConfigDictionary,
    restrictedDiscoveredCollections: string[],
    lastPubId?: string
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    const mergedResourceConfig = mergeResourceConfigs(
        draftSpecData,
        resourceConfig,
        restrictedDiscoveredCollections
    );

    const mergedDraftSpec = generateCaptureDraftSpec(
        mergedResourceConfig,
        draftSpecData.spec.endpoint
    );

    return modifyDraftSpec(
        mergedDraftSpec,
        {
            draft_id: draftSpecData.draft_id,
            catalog_name: draftSpecData.catalog_name,
        },
        lastPubId
    );
};

export const storeUpdatedBindings = (
    response: any,
    resourceConfig: ResourceConfigDictionary,
    restrictedDiscoveredCollections: string[],
    addCollection: Function,
    setResourceConfig: Function,
    setCurrentCollection: Function
): void => {
    const existingCollections = Object.keys(resourceConfig);
    const updatedBindings = response.data[0].spec.bindings;

    // TODO (defect): Handle updating the list of collections and resource config inside
    //   the resource config store. By updating the list of collections in a single call, the
    //   latency incurred when generating the collection autocomplete values should decrease.
    //   The loading condition for the BindingsMultiEditor component will need to be updated.
    updatedBindings.forEach((binding: any) => {
        if (
            !existingCollections.includes(binding.target) &&
            !restrictedDiscoveredCollections.includes(binding.target)
        ) {
            addCollection(binding.target);

            setResourceConfig(binding.target, {
                data: binding.resource,
                errors: [],
            });
        }
    });

    setCurrentCollection(
        hasLength(updatedBindings) ? updatedBindings[0].target : null
    );
};
