import type { PostgrestResponse } from '@supabase/postgrest-js';
import type { Schema } from 'src/types';

import { supabaseClient } from 'src/context/GlobalProviders';
import { supabaseRetry, TABLES } from 'src/services/supabase';

export interface PublicationSpecsExt_PublicationHistory {
    live_spec_id: string;
    pub_id: string;
    detail: null;
    published_at: string; //timestamptz
    spec_type: string;
    user_id: string;
    catalog_name: string;
    last_pub_id: string;
    user_email: string;
    user_full_name: null;
    user_avatar_url: null;
}

export type PublicationSpecsExt_PubIds = Pick<
    PublicationSpecsExt_PublicationHistory,
    'pub_id' | 'published_at' | 'detail' | 'user_email'
>;

export interface PublicationSpecsExt_Spec {
    published_at: string;
    pub_id: string;
    spec: Schema;
}

export const getPublicationHistoryByCatalogName = (catalogName: string) => {
    return supabaseClient
        .from(TABLES.PUBLICATION_SPECS_EXT)
        .select(`pub_id, published_at, detail, user_email`)
        .eq('catalog_name', catalogName)
        .order('published_at', {
            ascending: false,
        })
        .returns<PublicationSpecsExt_PubIds[]>();
};

export const getPublicationSpecByPublication = (
    catalogName: string,
    pubIds: [string | null, string | null]
) => {
    console.log('getPublicationSpecByPublication', { catalogName, pubIds });

    let query = supabaseClient
        .from(TABLES.PUBLICATION_SPECS_EXT)
        .select(`pub_id, spec, published_at`)
        .eq('catalog_name', catalogName);

    // If we have both look for both
    //  Otherwise we're probably looking up a NEW entity and only
    //  have a single pubId
    if (pubIds[0] && pubIds[1]) {
        query = query.in('pub_id', pubIds);
    } else {
        if (pubIds[0]) {
            query = query.eq('pub_id', pubIds[0]);
        }
        if (pubIds[1]) {
            query = query.eq('pub_id', pubIds[1]);
        }
    }

    return query.returns<PublicationSpecsExt_Spec[]>();
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
