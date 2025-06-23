import type { Entity, Schema } from 'src/types';

import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { TABLES } from 'src/services/supabase';

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

export interface LiveSpecsQuery_details extends LiveSpecsQuery {
    'data_plane_name': string;
    'id': string;
    'spec': {
        schema: {
            properties: Record<string, any>;
            required?: string[];
        };
        key: string[];
        projections?: Schema;
    };
    'created_at': string;
    'connector_logo_url': string;
    'connectorName:connector_title->>en-US::text': string;
    'connector_tag_documentation_url': string;
    'reactor_address': string;
}
const detailsQuery = queryColumns
    .concat([
        'data_plane_name',
        'id',
        'last_pub_id',
        'updated_at',
        'created_at',
        'connector_logo_url:connector_logo_url->>en-US::text',
        'connectorName:connector_title->>en-US::text',
        'connector_tag_documentation_url',
        'reactor_address',
        'spec',
    ])
    .join(',');
function useLiveSpecs_details(specType: Entity, catalogName: string) {
    const { data, error, isValidating } = useQuery<LiveSpecsQuery_details[]>(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(detailsQuery)
            .eq('catalog_name', catalogName)
            .eq('spec_type', specType)
            .order('updated_at', {
                ascending: false,
            })
            .returns<LiveSpecsQuery_details[]>()
    );

    return {
        liveSpecs: data ?? (defaultResponse as LiveSpecsQuery_details[]),
        error,
        isValidating,
    };
}

export { useLiveSpecs, useLiveSpecs_details };
