import {
    CatalogStats,
    Entity,
    EntityWithCreateWorkflow,
    LiveSpecsExtBaseQuery,
} from 'types';
import pLimit from 'p-limit';

import { PostgrestResponse } from '@supabase/postgrest-js';

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

interface CollectionSelectorQuery {
    catalog_name: string;
    spec_type: string;
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

const getLiveSpecs_collectionsSelector = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<CollectionSelectorQuery>(TABLES.LIVE_SPECS_EXT)
        .select('catalog_name, id, spec_type', {
            count: 'exact',
        });

    queryBuilder = defaultTableFilter<CollectionSelectorQuery>(
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
    connectorId: string,
    searchQuery: string | null,
    sorting: SortingProps<any>[]
) => {
    const taskColumns: string =
        specType === 'capture'
            ? captureColumnsWithSpec
            : materializationsColumnsWithSpec;

    const columns = taskColumns.concat(',connector_id');

    let queryBuilder = supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(columns, {
            count: 'exact',
        })
        .eq('connector_id', connectorId)
        .not('catalog_name', 'ilike', 'ops/%')
        .not('catalog_name', 'ilike', 'demo/%');

    queryBuilder = distributedTableFilter<
        CaptureQueryWithSpec | MaterializationQueryWithSpec
    >(queryBuilder, ['catalog_name'], searchQuery, sorting).eq(
        'spec_type',
        specType
    );

    return queryBuilder;
};

// Hydration-specific queries
export interface LiveSpecsExtQuery_DetailsForm {
    catalog_name: string;
    id: string;
    spec_type: Entity;
    spec: any;
    detail: string | null;
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
    detail,
    connector_tag_id,
    connector_image_name,
    connector_image_tag,
    connector_logo_url:connector_logo_url->>en-US::text
`;

const getLiveSpecs_detailsForm = async (
    liveSpecId: string,
    specType: Entity
) => {
    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(DETAILS_FORM_QUERY)
        .eq('id', liveSpecId)
        .eq('spec_type', specType)
        .then(handleSuccess<LiveSpecsExtQuery_DetailsForm[]>, handleFailure);

    return data;
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
        .then(handleSuccess<LiveSpecsExtQuery_ByCatalogName[]>, handleFailure);

    return data;
};

export interface LiveSpecsExtQuery_ByCatalogNames {
    catalog_name: string;
    spec_type: Entity;
    spec: any;
    last_pub_id: string;
}

const CHUNK_SIZE = 10;
const getLiveSpecsByCatalogNames = async (
    specType: Entity | null,
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Array<
        Promise<PostgrestResponse<LiveSpecsExtQuery_ByCatalogNames>>
    > = [];
    let index = 0;

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

    const res = await Promise.all(promises);

    const errors = res.filter((r) => r.error);

    return errors[0] ?? res[0];
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
                `${prefix}/%`
            );
        });
    }

    const data = await queryBuilder.then(
        handleSuccess<CaptureQueryWithSpec[] | MaterializationQueryWithSpec[]>,
        handleFailure
    );

    return data;
};

export interface LiveSpecsExtQuery_ByLiveSpecId {
    catalog_name: string;
    id: string;
    spec_type: Entity;
    last_pub_id: string;
    spec: any;
}

const getLiveSpecsByLiveSpecId = async (
    liveSpecId: string,
    specType: Entity
) => {
    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select('catalog_name,id,spec_type,last_pub_id,spec')
        .eq('id', liveSpecId)
        .eq('spec_type', specType)
        .then(handleSuccess<LiveSpecsExtQuery_ByLiveSpecId[]>, handleFailure);

    return data;
};

export {
    getLiveSpecs_captures,
    getLiveSpecs_collections,
    getLiveSpecs_collectionsSelector,
    getLiveSpecs_existingTasks,
    getLiveSpecs_materializations,
    getLiveSpecs_detailsForm,
    getLiveSpecsByCatalogName,
    getLiveSpecsByCatalogNames,
    getLiveSpecsByConnectorId,
    getLiveSpecsByLiveSpecId,
};
