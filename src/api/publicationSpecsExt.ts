import { Schema } from 'types';

import { supabaseClient, TABLES } from 'services/supabase';

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
