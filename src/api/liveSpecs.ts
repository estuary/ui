import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { Entity } from 'types';

interface LiveSpecsExtQuery {
    catalog_name: string;
    spec_type: string;
    spec: any;
}

export const getLiveSpecsByCatalogName = async (
    catalogName: string,
    specType: Entity
) => {
    const data = await supabaseClient
        .from(TABLES.LIVE_SPECS_EXT)
        .select(`catalog_name,spec_type,spec`)
        .eq('catalog_name', catalogName)
        .eq('spec_type', specType)
        .then(handleSuccess<LiveSpecsExtQuery>, handleFailure);

    return data;
};
