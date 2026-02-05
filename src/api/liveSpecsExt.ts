import type { PostgrestResponse } from '@supabase/postgrest-js';
import type { ProtocolLabel } from 'data-plane-gateway/types/gen/consumer/protocol/consumer';
import type { LiveSpecsExtQuery_GroupedUpdates } from 'src/api/types';
import type { SortingProps } from 'src/services/supabase';
import type {
    CatalogStats,
    Entity,
    EntityWithCreateWorkflow,
    LiveSpecsExtBaseQuery,
    ManualTypedPostgrestResponse,
    Schema,
} from 'src/types';

import { DateTime } from 'luxon';
import pLimit from 'p-limit';

import { CONNECTOR_IMAGE, CONNECTOR_TITLE } from 'src/api/shared';
import { supabaseClient } from 'src/context/GlobalProviders';
import {
    defaultTableFilter,
    escapeReservedCharacters,
    handleFailure,
    handleSuccess,
    parsePagedFetchAllResponse,
    QUERY_PARAM_CONNECTOR_TITLE,
    SHARD_LABELS,
    SHARDS_DISABLE,
    supabaseRetry,
    TABLES,
} from 'src/services/supabase';
import { CHUNK_SIZE, DEMO_TENANT } from 'src/utils/misc-utils';
import { getCountSettings } from 'src/utils/table-utils';

const trialDuration = import.meta.env.VITE_TRIAL_DURATION;

const baseColumns = [
    'catalog_name',
    'id',
    'spec_type',
    'updated_at',
    'last_pub_id',
    'shard_template_id',
];

const commonColumns = baseColumns.concat([
    'connector_id',
    'connector_image_name',
    'connector_image_tag',
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
]);

export interface CaptureQuery extends LiveSpecsExtBaseQuery {
    writes_to: string[];
}
export interface CaptureQueryWithSpec extends CaptureQuery {
    spec: any;
}
export interface CaptureQueryWithStats extends CaptureQuery {
    stats?: CatalogStats;
}
export interface MaterializationQuery extends LiveSpecsExtBaseQuery {
    reads_from: string[];
}
export interface MaterializationQueryWithSpec extends MaterializationQuery {
    spec: any;
}
export interface MaterializationQueryWithStats extends MaterializationQuery {
    stats?: CatalogStats;
}
export type CollectionQuery = LiveSpecsExtBaseQuery;
export interface CollectionQueryWithStats extends CollectionQuery {
    stats?: CatalogStats;
}

const captureColumns = commonColumns.concat(['writes_to']).join(',');
const captureColumnsWithSpec = captureColumns.concat(',spec');

const materializationsColumns = commonColumns.concat(['reads_from']).join(',');
const materializationsColumnsWithSpec = materializationsColumns.concat(',spec');

const collectionColumns = baseColumns.join(',');

// Entity table-specific queries
const getLiveSpecs_captures = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<CaptureQuery>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(captureColumns, {
                count: getCountSettings(pagination),
            })
            .not('spec', 'is', null)
            .eq('spec_type', 'capture'),
        ['catalog_name', QUERY_PARAM_CONNECTOR_TITLE],
        searchQuery,
        sorting,
        pagination
    );
};

const getLiveSpecs_materializations = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<MaterializationQuery>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(materializationsColumns, {
                count: getCountSettings(pagination),
            })
            .not('spec', 'is', null)
            .eq('spec_type', 'materialization'),
        ['catalog_name', QUERY_PARAM_CONNECTOR_TITLE],
        searchQuery,
        sorting,
        pagination
    );
};

const getLiveSpecs_collections = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<CollectionQuery>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(collectionColumns, {
                count: getCountSettings(pagination),
            })
            .not('spec', 'is', null)
            .eq('spec_type', 'collection'),
        ['catalog_name'],
        searchQuery,
        sorting,
        pagination
    );
};

const collectionsSelectorColumns = 'catalog_name, id, updated_at, spec_type';

// TODO (settings) need to figure a nice way to get queries into the entity-utils object
const collectionsSelectors: Record<Entity, string> = {
    collection: 'catalog_name, id, updated_at, spec_type',
    capture: `${collectionsSelectorColumns}, writes_to`,
    materialization: `${collectionsSelectorColumns}, reads_from`,
};

interface CollectionSelectorQuery extends ManualTypedPostgrestResponse {
    catalog_name: string;
    id: string;
    spec_type: Entity;
    updated_at: string;
    writes_to?: string[];
    reads_from?: string[];
}

const getLiveSpecs_entitySelector = (
    pagination: any,
    specType: Entity,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<CollectionSelectorQuery>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(collectionsSelectors[specType], {
                count: 'exact',
            })
            .eq('spec_type', specType),
        ['catalog_name'],
        searchQuery,
        sorting,
        pagination
    );
};

const getLiveSpecs_existingTasks = (
    specType: Entity,
    connectorId: string,
    searchQuery: string | null,
    sorting: SortingProps<any>[]
) => {
    const taskColumns: string =
        specType === 'capture'
            ? captureColumnsWithSpec
            : materializationsColumnsWithSpec;

    const columns = taskColumns.concat(',connector_id');

    return defaultTableFilter<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    >(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(columns, {
                count: 'exact',
            })
            .eq('connector_id', connectorId)
            .not('catalog_name', 'ilike', 'ops/%')
            .not('catalog_name', 'ilike', `${DEMO_TENANT}%`)
            .eq('spec_type', specType),
        ['catalog_name'],
        searchQuery,
        sorting
    );
};

// Hydration-specific queries
export interface LiveSpecsExtQuery_DetailsForm {
    catalog_name: string;
    id: string;
    spec_type: Entity;
    spec: any;
    data_plane_id: string;
    data_plane_name: string | null;
    reactor_address: string | null;
    connector_tag_id: string;
    connector_image_name: string;
    connector_image_tag: string;
    connector_logo_url: string;
}

const DETAILS_FORM_QUERY = `
    catalog_name,
    id,
    spec_type,
    spec,
    data_plane_id,
    data_plane_name,
    reactor_address,
    connector_tag_id,
    connector_image_name,
    connector_image_tag,
    connector_logo_url:connector_logo_url->>en-US::text
`;

const getLiveSpecs_detailsForm = async (liveSpecId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(DETAILS_FORM_QUERY)
                .eq('id', liveSpecId),
        'getLiveSpecs_detailsForm'
    ).then(handleSuccess<LiveSpecsExtQuery_DetailsForm[]>, handleFailure);

    return data;
};

export interface LiveSpecsExtQuery_DataPlaneAuthReq {
    shard_labels: ProtocolLabel[];
}

const getLiveSpecs_dataPlaneAuthReq = async (catalogName: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(SHARD_LABELS)
                .eq('catalog_name', catalogName),
        'getLiveSpecs_dataPlaneAuthReq'
    ).then(handleSuccess<LiveSpecsExtQuery_DataPlaneAuthReq[]>, handleFailure);

    return data;
};

// Multipurpose queries
export interface LiveSpecsExtQuery_ByCatalogName {
    id: string;
    catalog_name: string;
    spec_type: string;
    spec: any;
    last_pub_id: string;
}

// TODO (live spec) - remove this and combine with getLatestLiveSpecByName
//  as the cata log name is a unique index on this
const getLiveSpecsByCatalogName = async (
    catalogName: string,
    specType: Entity
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(`id,catalog_name,spec_type,spec,last_pub_id`)
                .eq('catalog_name', catalogName)
                .eq('spec_type', specType),
        'getLiveSpecsByCatalogName'
    ).then(handleSuccess<LiveSpecsExtQuery_ByCatalogName[]>, handleFailure);

    return data;
};

export interface LiveSpecsExtQuery_ByCatalogNames {
    catalog_name: string;
    spec_type: Entity;
    spec: any;
    last_pub_id: string;
}

const getLiveSpecsByCatalogNames = async (
    specType: Entity | null,
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Array<
        Promise<PostgrestResponse<LiveSpecsExtQuery_ByCatalogNames>>
    > = [];
    let index = 0;

    // TODO (retry) promise generator
    const queryPromiseGenerator = (idx: number) => {
        let query = supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(`catalog_name,spec_type,spec,last_pub_id`)
            .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE));
        if (specType) {
            query = query.eq('spec_type', specType);
        }
        return query;
    };

    while (index < catalogNames.length) {
        // Have to do this to capture `index` correctly
        const prom = queryPromiseGenerator(index);
        promises.push(limiter(() => prom));

        index = index + CHUNK_SIZE;
    }

    const responses = await Promise.all(promises);
    return parsePagedFetchAllResponse<LiveSpecsExtQuery_ByCatalogNames>(
        responses
    );
};

const getLiveSpecsForGroupedUpdates = async (
    specType: Entity,
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Array<
        Promise<PostgrestResponse<LiveSpecsExtQuery_GroupedUpdates>>
    > = [];
    let index = 0;

    // TODO (retry) promise generator
    const queryPromiseGenerator = (idx: number) => {
        return (
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                // TODO (mass row actions support disable)
                // We would need to fetch the spec as well for disable
                .select(`catalog_name,id`)
                .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE))
                .eq('spec_type', specType)
        );
    };

    while (index < catalogNames.length) {
        const prom = queryPromiseGenerator(index);
        promises.push(limiter(() => prom));
        index = index + CHUNK_SIZE;
    }

    const responses = await Promise.all(promises);
    return parsePagedFetchAllResponse<LiveSpecsExtQuery_GroupedUpdates>(
        responses
    );
};

const getLiveSpecsByConnectorId = async (
    specType: EntityWithCreateWorkflow,
    connectorId: string,
    prefixFilters?: string[]
) => {
    const taskColumns: string =
        specType === 'capture'
            ? captureColumnsWithSpec
            : materializationsColumnsWithSpec;

    const columns = taskColumns.concat(',connector_id');

    let queryBuilder = supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(columns)
        .eq('connector_id', connectorId)
        .eq('spec_type', specType);

    if (prefixFilters && prefixFilters.length > 0) {
        prefixFilters.forEach((prefix) => {
            queryBuilder = queryBuilder.not(
                'catalog_name',
                'ilike',
                `${escapeReservedCharacters(prefix)}/%`
            );
        });
    }

    const data = await supabaseRetry(
        () => queryBuilder,
        'getLiveSpecsByConnectorId'
    ).then(
        handleSuccess<CaptureQueryWithSpec[] | MaterializationQueryWithSpec[]>,
        handleFailure
    );

    return data;
};

export interface LiveSpecsExtQuery_ByLiveSpecId {
    built_spec: Schema | null;
    catalog_name: string;
    id: string;
    spec_type: Entity;
    last_pub_id: string;
    spec: any;
    connector_id: string;
}

const getLiveSpecsByLiveSpecId = async (liveSpecId: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(
                    'built_spec,catalog_name,id,spec_type,last_pub_id,spec,connector_id'
                )
                .eq('id', liveSpecId),
        'getLiveSpecsByLiveSpecId'
    ).then(handleSuccess<LiveSpecsExtQuery_ByLiveSpecId[]>, handleFailure);

    return data;
};

const getLiveSpecSpec = (liveSpecId: string) => {
    return supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(`spec`)
        .eq('id', liveSpecId)
        .single();
};

export interface LiveSpecsExtQuery_Latest {
    spec: any;
    id: string;
    last_pub_id: string;
}

const getLatestLiveSpecByName = async (catalogName: string) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.LIVE_SPECS_EXT)
                .select(`spec, id, last_pub_id`)
                .eq('catalog_name', catalogName)
                .single(),
        'getNotificationSubscriptionForUser'
    ).then(handleSuccess<LiveSpecsExtQuery_Latest>, handleFailure);

    return data;
};

const getLiveSpecShards = (tenant: string, entityType: Entity) => {
    return supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(SHARDS_DISABLE)
        .like('catalog_name', `${tenant}%`)
        .eq('spec_type', entityType);
};

export interface TrialCollectionQuery {
    catalog_name: string;
    updated_at: string;
}

const getTrialCollections = async (
    trialPrefixes: string[],
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Promise<PostgrestResponse<TrialCollectionQuery>>[] = [];
    let index = 0;

    const trialCollections = catalogNames.filter((name) =>
        trialPrefixes.some((prefix) => name.startsWith(prefix))
    );

    const promiseGenerator = (idx: number) => {
        const trialThreshold = DateTime.utc().minus({
            days: trialDuration,
        });
        const catalogNameFilter = trialCollections
            .slice(idx, idx + CHUNK_SIZE)
            .map((name) => `catalog_name.eq.${name}`)
            .join(',');

        return supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select('catalog_name,updated_at')
            .or(catalogNameFilter)
            .eq('spec_type', 'collection')
            .lt('updated_at', trialThreshold);
    };

    while (index < trialCollections.length) {
        const prom = promiseGenerator(index);
        promises.push(limiter(() => prom));

        index = index + CHUNK_SIZE;
    }

    const response = await Promise.all(promises);
    const errors = response.filter((r) => r.error);

    return errors[0] ?? { data: response.flatMap((r) => r.data) };
};

const liveSpecsExtRelatedColumns = ['catalog_name', 'reads_from', 'id'];
export const liveSpecsExtRelatedQuery = liveSpecsExtRelatedColumns.join(',');
export interface LiveSpecsExt_Related {
    catalog_name: string;
    reads_from: string[];
    id: string;
}
// const getLiveSpecsRelatedToMaterialization = async (
//     collectionNames: string[]
// ) => {
//     const limiter = pLimit(3);
//     const promises = [];
//     let index = 0;

//     // TODO (retry) promise generator
//     const promiseGenerator = (idx: number) => {
//         return supabaseClient
//             .from(TABLES.LIVE_SPECS_EXT)
//             .select(liveSpecsExtRelatedQuery)
//             .eq('spec_type', 'materialization')
//             .overlaps(
//                 'reads_from',
//                 collectionNames.slice(idx, idx + CHUNK_SIZE)
//             )
//             .returns<LiveSpecsExt_Related[]>();
//     };

//     while (index < collectionNames.length) {
//         const prom = promiseGenerator(index);
//         promises.push(limiter(() => prom));
//         index = index + CHUNK_SIZE;
//     }

//     const response = await Promise.all(promises);
//     const errors = response.filter((r) => r.error);
//     return errors[0] ?? response[0];
// };

export {
    getLatestLiveSpecByName,
    getLiveSpecShards,
    getLiveSpecSpec,
    getLiveSpecsByCatalogName,
    getLiveSpecsByCatalogNames,
    getLiveSpecsByConnectorId,
    getLiveSpecsByLiveSpecId,
    getLiveSpecsForGroupedUpdates,
    getLiveSpecs_captures,
    getLiveSpecs_collections,
    getLiveSpecs_dataPlaneAuthReq,
    getLiveSpecs_detailsForm,
    getLiveSpecs_entitySelector,
    getLiveSpecs_existingTasks,
    getLiveSpecs_materializations,
    getTrialCollections,
};
