import {
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    QUERY_PARAM_CONNECTOR_TITLE,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import {
    CatalogStats,
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
export interface CaptureQueryWithStats extends CaptureQuery {
    stats?: CatalogStats;
}
export interface MaterializationQuery extends LiveSpecsExtBaseQuery {
    reads_from: string[];
}
export interface MaterializationQueryWithStats extends MaterializationQuery {
    stats?: CatalogStats;
}
export type CollectionQuery = Pick<
    LiveSpecsExtBaseQuery,
    'spec_type' | 'catalog_name' | 'updated_at' | 'id' | 'last_pub_id'
>;
export interface CollectionQueryWithStats extends CollectionQuery {
    stats?: CatalogStats;
}

const captureColumns = commonColumns.concat(['writes_to']).join(',');

const materializationsColumns = commonColumns.concat(['reads_from']).join(',');

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

// Multipurpose queries
const getLiveSpecsByConnectorId = async <
    T = CaptureQuery[] | MaterializationQuery[]
>(
    specType: EntityWithCreateWorkflow,
    connectorTagId: string
) => {
    const taskColumns: string =
        specType === 'capture' ? captureColumns : materializationsColumns;

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
    getLiveSpecs_materializations,
    getLiveSpecsByConnectorId,
};
