import { supabaseClient, TABLES } from 'services/supabase';
import { Entity } from 'types';

export interface PublicationSpecsExt_PublicationHistory {
    draft_id: string;
    catalog_name: string;
    spec_type: Entity;
    updated_at: string;
}

export const getPublicationHistoryByCatalogName = (catalogName: string) => {
    // const data = await supabaseClient
    // 	.from(TABLES.PUBLICATION_SPECS_EXT)
    // 	.select(`*`)
    // 	.eq('catalog_name', catalogName)
    // 	.then(
    // 		handleSuccess<PublicationSpecsExt_PublicationHistory>,
    // 		handleFailure
    // 	);

    // return data;

    return supabaseClient
        .from<PublicationSpecsExt_PublicationHistory>(
            TABLES.PUBLICATION_SPECS_EXT
        )
        .select(`*`)
        .eq('catalog_name', catalogName);
};
