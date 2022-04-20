import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient } from '@supabase/supabase-js';

if (
    !process.env.REACT_APP_SUPABASE_URL ||
    !process.env.REACT_APP_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

const supabaseSettings = {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

export enum TABLES {
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DISCOVERS = 'discovers',
    DRAFT_ERRORS = 'draft_errors',
    DRAFT_SPECS = 'draft_specs',
    DRAFT_SPECS_EXT = 'draft_specs_ext',
    DRAFTS = 'drafts',
    LIVE_SPECS = 'live_specs',
    PUBLICATION_SPECS = 'publication_specs',
    PUBLICATIONS = 'publications',
}

export enum RPCS {
    VIEW_LOGS = 'view_logs',
}

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

export const DEFAULT_POLLING_INTERVAL = 500;

export const defaultTableFilter = <Data>(
    query: PostgrestFilterBuilder<Data>,
    searchParam: Array<keyof Data>,
    searchQuery: string | null,
    columnToSort: keyof Data,
    sortDirection: string,
    pagination: { from: number; to: number }
) => {
    let queryBuilder = query;

    if (searchQuery) {
        queryBuilder = queryBuilder.or(
            searchParam
                .map((param) => {
                    return `${param}.ilike.*${searchQuery}*`;
                })
                .join(',')
        );
    }

    return queryBuilder
        .order(columnToSort, {
            ascending: sortDirection === 'asc',
        })
        .range(pagination.from, pagination.to);
};
