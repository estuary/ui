import { createClient } from '@supabase/supabase-js';

const supabaseSettings = {
    url: process.env.REACT_APP_SUPABASE_URL ?? '',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY ?? '',
};

export const supabase = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);
