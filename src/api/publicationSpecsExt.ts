import { supabaseClient, TABLES } from 'services/supabase';
import { Entity, Schema } from 'types';

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
        .from<PublicationSpecsExt_PublicationHistory>(
            TABLES.PUBLICATION_SPECS_EXT
        )
        .select(`*`)
        .eq('catalog_name', catalogName)
        .order('published_at', {
            ascending: false,
        });
};

export const getLiveSpecIdByPublication = (
    pubId: string | null, // Do not actually pass null... just making typing easiser
    entityType: Entity
) => {
    return supabaseClient
        .from<PublicationSpecsExt_PublicationHistory>(
            TABLES.PUBLICATION_SPECS_EXT
        )
        .select(`live_spec_id`)
        .eq('pub_id', pubId)
        .eq('spec_type', entityType);
};
