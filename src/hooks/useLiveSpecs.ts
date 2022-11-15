import { useDebugValue } from 'react';
import { TABLES } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelect } from './supabase-swr/';

export interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
}

const queryColumns = ['catalog_name', 'spec_type'];

const defaultResponse: LiveSpecsQuery[] = [];

function useLiveSpecs(specType: string) {
    const draftSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: (query) => query.eq('spec_type', specType),
        },
        [specType]
    );

    const { data, error, isValidating } = useSelect(draftSpecQuery);

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
        isValidating,
    };
}

export interface LiveSpecsQuery_spec_general {
    catalog_name: string;
    spec: {
        schema: {
            properties: Record<string, any>;
            required?: string[];
        };
        key: string[];
    };
    spec_type: string;
}
const queryColumns_spec_general = ['catalog_name', 'spec', 'spec_type'];

export function useLiveSpecs_spec_general(specType: string) {
    const liveSpecQuery = useQuery<LiveSpecsQuery_spec_general>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns_spec_general,
            filter: (query) => query.eq('spec_type', specType),
        },
        [specType]
    );

    const { data, error, isValidating } = useSelect(liveSpecQuery);

    return {
        liveSpecs: data
            ? data.data
            : (defaultResponse as LiveSpecsQuery_spec_general[]),
        error,
        isValidating,
    };
}

export interface LiveSpecsQuery_spec {
    id: string;
    catalog_name: string;
    spec: {
        schema: {
            properties: Record<string, any>;
            required?: string[];
        };
        key: string[];
    };
    spec_type: string;
}
const specQuery = ['id', 'catalog_name', 'spec', 'spec_type'];

const withKey =
    (key: string) =>
    (useSWRNext: any) =>
    (params: any, fetcher: any, config: any) => {
        // Pass the serialized key, and unserialize it in fetcher.
        return useSWRNext(key, () => fetcher(...params), config);
    };

export function useLiveSpecs_spec(id: string, collectionNames?: string[]) {
    useDebugValue(`useLiveSpecs_spec ${collectionNames?.join(', ')}`);
    const liveSpecQuery = useQuery<LiveSpecsQuery_spec>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: specQuery,
            filter: (query) =>
                query.filter('catalog_name', 'in', `(${collectionNames})`),
        },
        [collectionNames]
    );

    const { data, error } = useSelect(
        hasLength(collectionNames) ? liveSpecQuery : null,
        { use: [withKey(id)] }
    );

    return {
        liveSpecs: data
            ? data.data
            : (defaultResponse as LiveSpecsQuery_spec[]),
        error,
    };
}

export default useLiveSpecs;
