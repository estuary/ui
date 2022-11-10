import {
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    defaultTableFilter,
    QUERY_PARAM_CONNECTOR_TITLE,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { LiveSpecsExtBaseQuery } from 'types';

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
    'writes_to',
]);

export interface CaptureQuery extends LiveSpecsExtBaseQuery {
    writes_to: string[];
}
export interface MaterializationQuery extends LiveSpecsExtBaseQuery {
    reads_from: string[];
}
export type CollectionQuery = Pick<
    LiveSpecsExtBaseQuery,
    'spec_type' | 'catalog_name' | 'updated_at' | 'id' | 'last_pub_id'
>;

const captureColumns = commonColumns
    .concat(['connector_image_name', 'writes_to'])
    .join(',');

const materializationsColumns = commonColumns.concat(['reads_from']).join(',');

const collectionColums = baseColumns.join(',');

const getLiveSpecs_captures = (
    pagination: any,
    searchQuery: any,
    columnToSort: any,
    sortDirection: any
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
        columnToSort,
        sortDirection,
        pagination
    ).eq('spec_type', 'capture');

    return queryBuilder;
};

const getLiveSpecs_materializations = (
    pagination: any,
    searchQuery: any,
    columnToSort: any,
    sortDirection: any
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
        columnToSort,
        sortDirection,
        pagination
    ).eq('spec_type', 'materialization');

    return queryBuilder;
};

const getLiveSpecs_collections = (
    pagination: any,
    searchQuery: any,
    columnToSort: any,
    sortDirection: any
) => {
    let queryBuilder = supabaseClient
        .from<CollectionQuery>(TABLES.LIVE_SPECS_EXT)
        .select(collectionColums, {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<CollectionQuery>(
        queryBuilder,
        ['catalog_name'],
        searchQuery,
        columnToSort,
        sortDirection,
        pagination
    ).eq('spec_type', 'collection');

    return queryBuilder;
};

export {
    getLiveSpecs_captures,
    getLiveSpecs_collections,
    getLiveSpecs_materializations,
};
