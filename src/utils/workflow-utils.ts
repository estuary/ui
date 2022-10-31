import { generateCaptureDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig';

const mergeResourceConfigs = (
    queryData: DraftSpecQuery,
    resourceConfig: ResourceConfigDictionary,
    existingCollections: string[],
    restrictedDiscoveredCollections: string[]
): ResourceConfigDictionary => {
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
    existingCollections: string[],
    restrictedDiscoveredCollections: string[],
    lastPubId?: string
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    const mergedResourceConfig = mergeResourceConfigs(
        draftSpecData,
        resourceConfig,
        existingCollections,
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
    existingCollections: string[],
    restrictedDiscoveredCollections: string[],
    addCollection: Function,
    setResourceConfig: Function,
    setCurrentCollection: Function
): void => {
    const updatedBindings = response.data[0].spec.bindings;

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

    setCurrentCollection(updatedBindings[0].target);
};
