import {
    generateCaptureDraftSpec,
    getDraftSpecsBySpecType,
    modifyDraftSpec,
} from 'api/draftSpecs';
import { LiveSpecsExtQuery_ByCatalogNames } from 'api/liveSpecs';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEmpty, isEqual } from 'lodash';
import pLimit from 'p-limit';
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

export const modifyDiscoveredDraftSpec = async (
    response: {
        data: DraftSpecQuery[];
        error?: undefined;
    },
    resourceConfig: ResourceConfigDictionary,
    restrictedDiscoveredCollections: string[],
    supabaseConfig?: { catalogName: string; lastPubId: string }
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
        supabaseConfig?.catalogName,
        supabaseConfig?.lastPubId
    );
};

interface CollectionData {
    [key: string]: {
        spec: any;
        expect_pub_id: string | null;
    };
}

export const getBoundCollectionSpecs = (
    boundCollections: string[],
    draftSpecData: DraftSpecQuery[],
    liveSpecData: LiveSpecsExtQuery_ByCatalogNames[]
): CollectionData => {
    let collectionSpecs: CollectionData = {};

    boundCollections.forEach((collection) => {
        const draftSpecQuery = draftSpecData.find(
            ({ catalog_name }) => catalog_name === collection
        );
        const liveSpecQuery = liveSpecData.find(
            ({ catalog_name }) => catalog_name === collection
        );

        if (draftSpecQuery) {
            const { spec, expect_pub_id } = draftSpecQuery;

            collectionSpecs = {
                ...collectionSpecs,
                [collection]: { spec, expect_pub_id },
            };
        } else if (liveSpecQuery) {
            const { spec, last_pub_id } = liveSpecQuery;

            collectionSpecs = {
                ...collectionSpecs,
                [collection]: { spec, expect_pub_id: last_pub_id },
            };
        } else {
            console.log(`Could not find any collection data for ${collection}`);
        }
    });

    return collectionSpecs;
};

export const modifyDiscoveredCollectionDraftSpec = async (
    currentDraftId: string,
    collectionData: CollectionData,
    errorTitle: string,
    callFailed: Function
): Promise<PromiseLike<CallSupabaseResponse<any>>[] | null> => {
    const draftSpecsResponse = await getDraftSpecsBySpecType(
        currentDraftId,
        'collection'
    );

    if (draftSpecsResponse.error) {
        return callFailed({
            error: {
                title: errorTitle,
                error: draftSpecsResponse.error,
            },
        });
    }

    if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
        const limiter = pLimit(3);
        const promises: PromiseLike<CallSupabaseResponse<any>>[] = [];

        draftSpecsResponse.data.forEach((query) => {
            const boundCollectionData = Object.hasOwn(
                collectionData,
                query.catalog_name
            )
                ? collectionData[query.catalog_name]
                : null;

            if (
                boundCollectionData &&
                !isEmpty(boundCollectionData.spec) &&
                !isEqual(query.spec, boundCollectionData.spec)
            ) {
                const promise = modifyDraftSpec(
                    boundCollectionData.spec,
                    {
                        draft_id: currentDraftId,
                        catalog_name: query.catalog_name,
                        spec_type: 'collection',
                    },
                    null,
                    boundCollectionData.expect_pub_id
                );

                promises.push(limiter(() => promise));
            }
        });

        return promises.length > 0 ? promises : null;
    } else {
        return null;
    }
};
