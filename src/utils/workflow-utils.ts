import {
    DraftSpecsExtQuery_ByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEmpty } from 'lodash';
import { CallSupabaseResponse } from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Schema } from 'types';
import {
    CaptureDef,
    CaptureEndpoint,
    MaterializationDef,
} from '../../flow_deps/flow';

// const mergeResourceConfigs = (
//     queryData: DraftSpecQuery,
//     resourceConfig: ResourceConfigDictionary,
//     restrictedDiscoveredCollections: string[]
// ): ResourceConfigDictionary => {
//     const existingCollections = Object.keys(resourceConfig);
//     const mergedResourceConfig: ResourceConfigDictionary = {};

//     Object.entries(resourceConfig).forEach(([key, value]) => {
//         mergedResourceConfig[key] = value;
//     });

//     queryData.spec.bindings.forEach((binding: any) => {
//         if (
//             !existingCollections.includes(binding.target) &&
//             !restrictedDiscoveredCollections.includes(binding.target)
//         ) {
//             mergedResourceConfig[binding.target] = {
//                 data: binding.resource,
//                 errors: [],
//             };
//         }
//     });

//     return mergedResourceConfig;
// };

export const generateCaptureDraftSpec = (
    endpoint: CaptureEndpoint,
    resourceConfigs: ResourceConfigDictionary | null,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null
): CaptureDef => {
    const draftSpec: CaptureDef = isEmpty(existingTaskData)
        ? {
              bindings: [],
              endpoint: {},
          }
        : existingTaskData.spec;

    draftSpec.endpoint.connector = endpoint.connector;

    if (resourceConfigs) {
        Object.keys(resourceConfigs).forEach((collectionName) => {
            const resourceConfig = resourceConfigs[collectionName].data;

            if (Object.keys(resourceConfig).length > 0) {
                const existingBindingIndex = draftSpec.bindings.findIndex(
                    (binding: any) => binding.target === collectionName
                );

                if (existingBindingIndex > -1) {
                    draftSpec.bindings[existingBindingIndex].resource = {
                        ...resourceConfig,
                    };
                } else {
                    draftSpec.bindings.push({
                        target: collectionName,
                        resource: {
                            ...resourceConfig,
                        },
                    });
                }
            }
        });
    }

    return draftSpec;
};

export const generateMaterializationDraftSpec = (
    config: any,
    image: string,
    resources?: any,
    existingTaskData?: DraftSpecsExtQuery_ByCatalogName | null
) => {
    const draftSpec: MaterializationDef = isEmpty(existingTaskData)
        ? {
              bindings: [],
              endpoint: { connector: {} },
          }
        : existingTaskData.spec;

    draftSpec.endpoint.connector = { config, image };

    if (resources) {
        Object.keys(resources).forEach((collectionName) => {
            const resourceConfig = resources[collectionName].data;

            if (Object.keys(resourceConfig).length > 0) {
                const existingBindingIndex = draftSpec.bindings.findIndex(
                    (binding: any) => binding.source === collectionName
                );

                if (existingBindingIndex > -1) {
                    draftSpec.bindings[existingBindingIndex].resource = {
                        ...resourceConfig,
                    };
                } else {
                    draftSpec.bindings.push({
                        source: collectionName,
                        resource: {
                            ...resourceConfig,
                        },
                    });
                }
            }
        });
    }

    return draftSpec;
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
    supabaseConfig?: SupabaseConfig | null
): Promise<CallSupabaseResponse<any>> => {
    const draftSpecData = response.data[0];

    return modifyDraftSpec(
        draftSpecData.spec,
        {
            draft_id: draftSpecData.draft_id,
            catalog_name: draftSpecData.catalog_name,
        },
        supabaseConfig?.catalogName,
        supabaseConfig?.lastPubId
    );
};

export const modifyExistingCaptureDraftSpec = async (
    draftId: string,
    connectorImage: string,
    encryptedEndpointConfig: Schema,
    resourceConfig: ResourceConfigDictionary,
    existingTaskData: DraftSpecsExtQuery_ByCatalogName | null
): Promise<CallSupabaseResponse<any>> => {
    const draftSpec = generateCaptureDraftSpec(
        {
            connector: {
                image: connectorImage,
                config: encryptedEndpointConfig,
            },
        },
        resourceConfig,
        existingTaskData
    );

    return modifyDraftSpec(draftSpec, {
        draft_id: draftId,
        spec_type: 'capture',
    });
};
