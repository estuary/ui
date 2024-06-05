import { TABLES } from 'services/supabase';
import { Entity, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelect } from './supabase-swr/';

export interface LiveSpecsQuery extends Schema {
    catalog_name: string;
    spec_type: string;
    // Filtering only
    updated_at: undefined;
}

const queryColumns = ['catalog_name', 'spec_type'];
const defaultResponse: LiveSpecsQuery[] = [];

const withKey =
    (key: string) =>
    (useSWRNext: any) =>
    (params: any, fetcher: any, config: any) => {
        // Pass the serialized key, and unserialize it in fetcher.
        return useSWRNext(key, () => fetcher(...params), config);
    };

function useLiveSpecs(specType?: Entity, matchName?: string) {
    const draftSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: (query) => {
                let queryBuilder = query
                    .eq('spec_type', specType)
                    .order('updated_at', {
                        ascending: false,
                    });

                if (matchName) {
                    queryBuilder = queryBuilder.like(
                        'catalog_name',
                        `${matchName}%`
                    );
                }

                return queryBuilder;
            },
        },
        [specType, matchName]
    );

    const { data, error, isValidating } = useSelect(
        specType ? draftSpecQuery : null
    );

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
        isValidating,
    };
}

function useLiveSpecs_details(specType: Entity, catalogName: string) {
    const draftSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: `
                id,
                updated_at,
                created_at,
                connectorName:connector_title->>en-US::text,
                connector_tag_documentation_url,
                writes_to,
                reads_from,
                spec
            `,
            filter: (query) => {
                return query
                    .eq('catalog_name', catalogName)
                    .eq('spec_type', specType)
                    .order('updated_at', {
                        ascending: false,
                    });
            },
        },
        [specType, catalogName]
    );

    const { data, error, isValidating } = useSelect(draftSpecQuery);

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
        isValidating,
    };
}

export interface LiveSpecsQuery_spec extends LiveSpecsQuery {
    id: string;
    spec: {
        schema: {
            properties: Record<string, any>;
            required?: string[];
        };
        key: string[];
    };
}
const specQuery = queryColumns.concat(['id', 'spec', 'last_pub_id']);

export function useLiveSpecs_spec(id: string, collectionNames?: string[]) {
    const liveSpecQuery = useQuery<LiveSpecsQuery_spec>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: specQuery,
            filter: (query) =>
                query.filter('catalog_name', 'in', `(${collectionNames})`),
        },
        [collectionNames]
    );

    const { data, error, isValidating } = useSelect(
        hasLength(collectionNames) ? liveSpecQuery : null,
        { use: [withKey(id)] }
    );

    return {
        liveSpecs: data
            ? data.data
            : (defaultResponse as LiveSpecsQuery_spec[]),
        error,
        isValidating,
    };
}

export { useLiveSpecs, useLiveSpecs_details };
