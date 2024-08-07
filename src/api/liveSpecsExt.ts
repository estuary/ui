import { PostgrestResponse } from '@supabase/postgrest-js';
import { supabaseClient } from 'context/Supabase';
import pLimit from 'p-limit';
import {
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    defaultTableFilter,
    escapeReservedCharacters,
    handleFailure,
    handleSuccess,
    QUERY_PARAM_CONNECTOR_TITLE,
    SortingProps,
    supabaseRetry,
    TABLES,
} from 'services/supabase';
import {
    CatalogStats,
    Entity,
    EntityWithCreateWorkflow,
    LiveSpecsExtBaseQuery,
} from 'types';
import { CHUNK_SIZE, DEMO_TENANT } from 'utils/misc-utils';
import { getCountSettings } from 'utils/table-utils';

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
    return defaultTableFilter<CaptureQuery[]>(
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
    return defaultTableFilter<MaterializationQuery[]>(
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
    return defaultTableFilter<CollectionQuery[]>(
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
const collectionsSelectorColumns_capture = `${collectionsSelectorColumns}, writes_to`;

interface CollectionSelectorQuery {
    catalog_name: string;
    id: string;
    spec_type: Entity;
    updated_at: string;
    writes_to?: string[];
}

const getLiveSpecs_collectionsSelector = (
    pagination: any,
    specType: Entity,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    return defaultTableFilter<CollectionSelectorQuery[]>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(
                specType === 'capture'
                    ? collectionsSelectorColumns_capture
                    : collectionsSelectorColumns,
                {
                    count: 'exact',
                }
            )
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
        CaptureQueryWithSpec[] | MaterializationQueryWithSpec[]
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

// Multipurpose queries
export interface LiveSpecsExtQuery_ByCatalogName {
    id: string;
    catalog_name: string;
    spec_type: string;
    spec: any;
    last_pub_id: string;
}

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
                    'catalog_name,id,spec_type,last_pub_id,spec,connector_id'
                )
                .eq('id', liveSpecId),
        'getLiveSpecsByLiveSpecId'
    ).then(handleSuccess<LiveSpecsExtQuery_ByLiveSpecId[]>, handleFailure);

    return data;
};

export {
    getLiveSpecs_captures,
    getLiveSpecs_collections,
    getLiveSpecs_collectionsSelector,
    getLiveSpecs_detailsForm,
    getLiveSpecs_existingTasks,
    getLiveSpecs_materializations,
    getLiveSpecsByCatalogName,
    getLiveSpecsByCatalogNames,
    getLiveSpecsByConnectorId,
    getLiveSpecsByLiveSpecId,
};
