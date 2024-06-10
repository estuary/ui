import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { supabaseClient } from 'context/Supabase';
import { useMemo } from 'react';
import { TABLES } from 'services/supabase';
import { Entity, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

export interface LiveSpecsQuery extends Schema {
    catalog_name: string;
    spec_type: string;
    // Filtering only
    updated_at: undefined;
}

const queryColumns = ['catalog_name', 'spec_type'];
const defaultResponse: LiveSpecsQuery[] = [];

function useLiveSpecs(specType?: Entity, matchName?: string) {
    const draftSpecQuery = useMemo(() => {
        if (!specType) {
            return null;
        }

        let queryBuilder = supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(queryColumns.join(','))
            .eq('spec_type', specType)
            .order('updated_at', {
                ascending: false,
            });

        if (matchName) {
            queryBuilder = queryBuilder.like('catalog_name', `${matchName}%`);
        }

        return queryBuilder.returns<LiveSpecsQuery[]>();
    }, [matchName, specType]);

    const { data, error, isValidating } = useQuery(draftSpecQuery);

    return {
        liveSpecs: data ?? defaultResponse,
        error,
        isValidating,
    };
}

const LiveSpecsDetailsQuery = `
                updated_at,
                created_at,
                connectorName:connector_title->>en-US::text,
                connector_tag_documentation_url,
                writes_to,
                reads_from,
                spec
            `;
function useLiveSpecs_details(specType: Entity, catalogName: string) {
    const { data, error, isValidating } = useQuery<LiveSpecsQuery[]>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(LiveSpecsDetailsQuery)
            .eq('catalog_name', catalogName)
            .eq('spec_type', specType)
            .order('updated_at', {
                ascending: false,
            })
            .returns<LiveSpecsQuery[]>()
    );

    return {
        liveSpecs: data ?? defaultResponse,
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
const specQuery = queryColumns.concat(['id', 'spec', 'last_pub_id']).join(',');
export function useLiveSpecs_spec(id: string, collectionNames?: string[]) {
    const liveSpecQuery = useMemo(() => {
        if (!hasLength(collectionNames)) {
            return null;
        }

        return supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(specQuery)
            .filter('catalog_name', 'in', `(${collectionNames})`)
            .returns<LiveSpecsQuery_spec[]>();
    }, [collectionNames]);

    const { data, error, isValidating } =
        useQuery<LiveSpecsQuery_spec[]>(liveSpecQuery);

    return {
        liveSpecs: data ?? (defaultResponse as LiveSpecsQuery_spec[]),
        error,
        isValidating,
    };
}

export { useLiveSpecs, useLiveSpecs_details };
