import { supabaseClient, TABLES } from 'services/supabase';
import { Schema } from 'types';

export interface PublicationSpecsExt_PublicationHistory {
    catalog_name: string;
    detail: null;
    last_pub_id: string;
    live_spec_id: string;
    pub_id: string;
    published_at: string;
    //timestamptz
    spec: Schema;
    spec_type: string;
    user_avatar_url: null;
    user_email: string;
    user_full_name: null;
    user_id: string;
}

export const getPublicationHistoryByCatalogName = (catalogName: string) => {
    // const data = await supabaseClient
    //  .from(TABLES.PUBLICATION_SPECS_EXT)
    //  .select(`*`)
    //  .eq('catalog_name', catalogName)
    //  .then(
    //      handleSuccess<PublicationSpecsExt_PublicationHistory>,
    //      handleFailure
    //  );

    // return data;

    return supabaseClient
        .from<PublicationSpecsExt_PublicationHistory>(
            TABLES.PUBLICATION_SPECS_EXT
        )
        .select(`*`)
        .eq('catalog_name', catalogName);
};
