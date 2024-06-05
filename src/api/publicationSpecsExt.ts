import { PostgrestResponse } from '@supabase/postgrest-js';
import { supabaseClient, supabaseRetry, TABLES } from 'services/supabase';
import { Schema } from 'types';

export interface PublicationSpecsExt_PublicationHistory {
    live_spec_id: string;
    pub_id: string;
    detail: null;
    published_at: string; //timestamptz
    spec: Schema;
    spec_type: string;
    user_id: string;
    catalog_name: string;
    last_pub_id: string;
    user_email: string;
    user_full_name: null;
    user_avatar_url: null;
}

export const getPublicationHistoryByCatalogName = (catalogName: string) => {
    return supabaseClient
        .from(TABLES.PUBLICATION_SPECS_EXT)
        .select(`*`)
        .eq('catalog_name', catalogName)
        .order('published_at', {
            ascending: false,
        })
        .returns<PublicationSpecsExt_PublicationHistory[]>();
};

export const getLiveSpecIdByPublication = (
    pubId: string | null, // Do not actually pass null... just making typing easiser
    catalogName: string
) => {
    return supabaseRetry<
        PostgrestResponse<PublicationSpecsExt_PublicationHistory>
    >(
        () =>
            supabaseClient
                .from(TABLES.PUBLICATION_SPECS_EXT)
                .select(`live_spec_id`)
                .eq('pub_id', pubId)
                .eq('catalog_name', catalogName)
                .returns<PublicationSpecsExt_PublicationHistory[]>(),
        'getLiveSpecIdByPublication'
    );
};
