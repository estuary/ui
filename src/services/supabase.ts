import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient } from '@supabase/supabase-js';
import { SupabaseQueryBuilder } from '@supabase/supabase-js/dist/module/lib/SupabaseQueryBuilder';
import { isEmpty } from 'lodash';
import { auth } from 'services/auth';

const supabaseSettings = {
    url: process.env.REACT_APP_SUPABASE_URL ?? '',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY ?? '',
};

export enum Tables {
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DISCOVERS = 'discovers',
    DRAFTS = 'drafts',
    PROFILES = 'profiles',
}

export const supabase = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

export const callSupabase = (
    supabaseQuery: SupabaseQueryBuilder<any> | PostgrestFilterBuilder<any> | any
) => {
    return supabaseQuery.then(async (response: any) => {
        if (response.status === 401) {
            await auth.signout();
            return Promise.reject({ message: 'common.loggedOut' });
        } else if (!isEmpty(response.error)) {
            return Promise.reject(response.error);
        } else {
            return response;
        }
    });
};
