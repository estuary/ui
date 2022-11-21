import { PostgrestResponse } from '@supabase/postgrest-js';
import pLimit from 'p-limit';
import {
    handleFailure,
    handleSuccess,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { Entity } from 'types';

export interface LiveSpecsExtQuery {
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

const CHUNK_SIZE = 10;
export const getLiveSpecsByCatalogNames = async (
    specType: Entity,
    catalogNames: string[]
) => {
    const limiter = pLimit(3);
    const promises: Array<Promise<PostgrestResponse<any>>> = [];
    let index = 0;

    const queryPromiseGenerator = (idx: number) =>
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(`catalog_name,spec_type,spec`)
            .eq('spec_type', specType)
            .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE));

    // This could probably be written in a fancy functional-programming way with
    // clever calls to concat and map and slice and stuff,
    // but I want it to be dead obvious what's happening here.
    while (index < catalogNames.length) {
        // Have to do this to capture `index` correctly
        const prom = queryPromiseGenerator(index);
        promises.push(limiter(() => prom));

        index = index + CHUNK_SIZE;
    }

    const res = await Promise.all(promises);

    const errors = res.filter((r) => r.error);

    return errors[0] ?? res[0];
};
