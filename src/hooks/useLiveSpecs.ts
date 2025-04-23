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
    };
    'writes_to': string[] | null;
    'created_at': string;
    'connector_logo_url': string;
    'connectorName:connector_title->>en-US::text': string;
    'connector_tag_documentation_url': string;
    'reactor_address': string;
    'reads_from': string[] | null;
}
const detailsQuery = queryColumns
    .concat([
        'data_plane_name',
        'id',
        'last_pub_id',
        'writes_to',
        'updated_at',
        'created_at',
        'connector_logo_url:connector_logo_url->>en-US::text',
        'connectorName:connector_title->>en-US::text',
        'connector_tag_documentation_url',
        'reactor_address',
        'reads_from',
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

export interface LiveSpecsQuery_parentCapture {
    catalog_name: string;
    target_id: string;
    live_specs: {
        catalog_name: string;
    };
}
function useLiveSpecs_parentCapture(id: string | null) {
    return useQuery(
        id
            ? supabaseClient
                  .from(TABLES.LIVE_SPEC_FLOWS)
                  .select(
                      'target_id, live_specs!live_spec_flows_source_id_fkey(catalog_name)'
                  )
                  .eq('target_id', id)
                  .eq('flow_type', 'capture')
                  .returns<LiveSpecsQuery_parentCapture[]>()
            : null
    );
}
// Used the query below to test out where the slow down was exactly
// export interface LiveSpecsFlowQuery_parentCapture {
//     source_id: string;
// }
// export interface LiveSpecsQuery_parentCapture {
//     catalog_name: string;
// }
// function useLiveSpecs_parentCapture(id: string | null) {
//     const { data, error, isValidating } = useQuery(
//         id
//             ? supabaseClient
//                   .from(TABLES.LIVE_SPEC_FLOWS)
//                   .select('source_id')
//                   .eq('target_id', id)
//                   .eq('flow_type', 'capture')
//                   .returns<LiveSpecsFlowQuery_parentCapture[]>()
//             : null
//     );

//     const liveSpecsQuery = useQuery(
//         !error && data && data[0].source_id
//             ? supabaseClient
//                   .from(TABLES.LIVE_SPECS)
//                   .select('catalog_name')
//                   .in(
//                       'id',
//                       data.map((datum) => datum.source_id)
//                   )
//                   .returns<LiveSpecsQuery_parentCapture[]>()
//             : null
//     );

//     return {
//         ...liveSpecsQuery,
//         isValidating: Boolean(isValidating || liveSpecsQuery.isValidating),
//     };
// }

export { useLiveSpecs, useLiveSpecs_details, useLiveSpecs_parentCapture };
