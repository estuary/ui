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

export const defaultTableFilter = (
    query: PostgrestFilterBuilder<any>,
    searchParam: string,
    searchQuery: string | null,
    columnToSort: string,
    sortDirection: string,
    pagination: { from: number; to: number }
) => {
    let queryBuilder = query;

    // // TODO (supabase) Change to text search? https://supabase.com/docs/reference/javascript/textsearch
    if (searchQuery) {
        queryBuilder = queryBuilder.ilike(searchParam, `%${searchQuery}%`);
    }

    return queryBuilder
        .order(columnToSort, {
            ascending: sortDirection === 'asc',
        })
        .range(pagination.from, pagination.to);
};
