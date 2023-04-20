import { useDebugValue } from 'react';
import { TABLES } from 'services/supabase';
import { Entity } from 'types';
import { hasLength } from 'utils/misc-utils';
import { useQuery, useSelect } from './supabase-swr/';

export interface LiveSpecsQuery {
    catalog_name: string;
    spec_type: string;
    // Filtering only
    updated_at: undefined;
}

const queryColumns = ['catalog_name', 'spec_type'];

const defaultResponse: LiveSpecsQuery[] = [];

function useLiveSpecs(specType: Entity) {
    const draftSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: (query) =>
                query.eq('spec_type', specType).order('updated_at', {
                    ascending: false,
                }),
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

export interface LiveSpecsQuery_spec extends LiveSpecsQuery {
    id: string;
    spec: {
        key: string[];
        schema: {
            properties: Record<string, any>;
            required?: string[];
        };
    };
}
const specQuery = queryColumns.concat(['id', 'spec']);

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
