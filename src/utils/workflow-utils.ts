import { generateCaptureDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig';

const mergeResourceConfigs = (
    queryData: DraftSpecQuery,
    resourceConfig: ResourceConfigDictionary,
    existingCollections: string[]
): ResourceConfigDictionary => {
    const mergedResourceConfig = {};

    Object.entries(resourceConfig).forEach(([key, value]) => {
        mergedResourceConfig[key] = value;
    });

    queryData.spec.bindings.forEach((binding: any) => {
        if (!existingCollections.includes(binding.target)) {
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
    lastPubId?: string
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    const mergedResourceConfig = mergeResourceConfigs(
        draftSpecData,
        resourceConfig,
        existingCollections
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
