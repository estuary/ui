import { PostgrestResponse } from '@supabase/postgrest-js';
import pLimit from 'p-limit';
import {
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    defaultTableFilter,
    distributedTableFilter,
    handleFailure,
    handleSuccess,
    QUERY_PARAM_CONNECTOR_TITLE,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import {
    CatalogStats,
    Entity,
    EntityWithCreateWorkflow,
    LiveSpecsExtBaseQuery,
} from 'types';

const baseColumns = [
    'catalog_name',
    'id',
    'spec_type',
    'updated_at',
    'last_pub_id',
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
export const captureColumnsWithSpec = commonColumns
    .concat(['writes_to', 'spec'])
    .join(',');

const materializationsColumns = commonColumns.concat(['reads_from']).join(',');
export const materializationsColumnsWithSpec = commonColumns
    .concat(['reads_from', 'spec'])
    .join(',');

const collectionColumns = baseColumns.join(',');

// Entity table-specific queries
const getLiveSpecs_captures = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<CaptureQuery>(TABLES.LIVE_SPECS_EXT)
        .select(captureColumns, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<CaptureQuery>(
        queryBuilder,
        ['catalog_name', QUERY_PARAM_CONNECTOR_TITLE],
        searchQuery,
        sorting,
        pagination
    ).eq('spec_type', 'capture');

    return queryBuilder;
};

const getLiveSpecs_materializations = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<MaterializationQuery>(TABLES.LIVE_SPECS_EXT)
        .select(materializationsColumns, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<MaterializationQuery>(
        queryBuilder,
        ['catalog_name', QUERY_PARAM_CONNECTOR_TITLE],
        searchQuery,
        sorting,
        pagination
    ).eq('spec_type', 'materialization');

    return queryBuilder;
};

const getLiveSpecs_collections = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<CollectionQuery>(TABLES.LIVE_SPECS_EXT)
        .select(collectionColumns, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<CollectionQuery>(
        queryBuilder,
        ['catalog_name'],
        searchQuery,
        sorting,
        pagination
    ).eq('spec_type', 'collection');

    return queryBuilder;
};

const getLiveSpecs_existingTasks = (
    specType: Entity,
    connectorTagId: string,
    searchQuery: string | null,
    sorting: SortingProps<any>[]
) => {
    const taskColumns: string =
        specType === 'capture'
            ? captureColumnsWithSpec
            : materializationsColumnsWithSpec;

    const columns = taskColumns.concat(',connector_tag_id');

    let queryBuilder = supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(columns, {
            count: 'exact',
        })
        .eq('connector_tag_id', connectorTagId);

    queryBuilder = distributedTableFilter<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    >(queryBuilder, ['catalog_name'], searchQuery, sorting).eq(
        'spec_type',
        specType
    );

    return queryBuilder;
};

// Multipurpose queries
export interface LiveSpecsExtQuery_ByCatalogName {
    catalog_name: string;
    spec_type: string;
    spec: any;
    last_pub_id: string;
}

const getLiveSpecsByCatalogName = async (
    catalogName: string,
    specType: Entity
) => {
    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(`catalog_name,spec_type,spec,last_pub_id`)
        .eq('catalog_name', catalogName)
        .eq('spec_type', specType)
        .then(handleSuccess<LiveSpecsExtQuery_ByCatalogName>, handleFailure);

    return data;
};

export interface LiveSpecsExtQuery_ByCatalogNames {
    catalog_name: string;
    spec_type: string;
    spec: any;
    last_pub_id: string;
}

const CHUNK_SIZE = 10;
const getLiveSpecsByCatalogNames = async (
    specType: Entity,
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Array<
        Promise<PostgrestResponse<LiveSpecsExtQuery_ByCatalogNames>>
    > = [];
    let index = 0;

    const queryPromiseGenerator = (idx: number) =>
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(`catalog_name,spec_type,spec,last_pub_id`)
            .eq('spec_type', specType)
            .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE));

    while (index < catalogNames.length) {
        // Have to do this to capture `index` correctly
        const prom = queryPromiseGenerator(index);
        promises.push(limiter(() => prom));

        index = index + CHUNK_SIZE;
    }

    const res = await Promise.all(promises);

    const errors = res.filter((r) => r.error);

    return errors[0] ?? res[0];
};

const getLiveSpecsByConnectorId = async <
    T = CaptureQueryWithSpec[] | MaterializationQueryWithSpec[]
>(
    specType: EntityWithCreateWorkflow,
    connectorTagId: string
) => {
    const taskColumns: string =
        specType === 'capture'
            ? captureColumnsWithSpec
            : materializationsColumnsWithSpec;

    const columns = taskColumns.concat(',connector_tag_id');

    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(columns)
        .eq('connector_tag_id', connectorTagId)
        .eq('spec_type', specType)
        .then(handleSuccess<T>, handleFailure);

    return data;
};

export {
    getLiveSpecs_captures,
    getLiveSpecs_collections,
    getLiveSpecs_existingTasks,
    getLiveSpecs_materializations,
    getLiveSpecsByCatalogName,
    getLiveSpecsByCatalogNames,
    getLiveSpecsByConnectorId,
};
