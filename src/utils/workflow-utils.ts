import { generateCaptureDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';

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

export interface SupabaseConfig {
    catalogName: string;
    lastPubId: string;
}

export const modifyDiscoveredDraftSpec = async (
    response: {
        data: DraftSpecQuery[];
        error?: undefined;
    },
    resourceConfig: ResourceConfigDictionary,
    restrictedDiscoveredCollections: string[],
    supabaseConfig?: SupabaseConfig | null,
    rediscoveryInitiated?: boolean
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    const mergedResourceConfig = rediscoveryInitiated
        ? null
        : mergeResourceConfigs(
              draftSpecData,
              resourceConfig,
              restrictedDiscoveredCollections
          );

    const mergedDraftSpec = generateCaptureDraftSpec(
        draftSpecData.spec.endpoint,
        mergedResourceConfig
    );

    if (rediscoveryInitiated) {
        mergedDraftSpec.bindings = draftSpecData.spec.bindings;
    }

    return modifyDraftSpec(
        mergedDraftSpec,
        {
            draft_id: draftSpecData.draft_id,
            catalog_name: draftSpecData.catalog_name,
        },
        supabaseConfig?.catalogName,
        supabaseConfig?.lastPubId
    );
};
