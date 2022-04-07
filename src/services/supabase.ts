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
    DRAFTS = 'drafts',
    PROFILES = 'profiles',
}

export enum RPCS {
    VIEW_LOGS = 'view_logs',
}

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

export const DEFAULT_POLLING_INTERVAL = 500;
