import { PostgrestSingleResponse } from '@supabase/postgrest-js';
import { supabaseClient } from 'src/context/GlobalProviders';
import { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import pLimit from 'p-limit';
import {
    RPCS,
    TABLES,
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    supabaseRetry,
    updateSupabase,
} from 'src/services/supabase';
import { Entity } from 'src/types';
import { CHUNK_SIZE } from 'src/utils/misc-utils';

interface CreateMatchData {
    draft_id: string | null;
    catalog_name: string;
    spec: any;
    spec_type?: Entity | null;
    expect_pub_id?: string;
}

interface UpdateMatchData {
    draft_id: string | null;
    catalog_name?: string;
    expect_pub_id?: string;
    spec_type?: Entity | null;
}

interface DraftSpecData {
    spec: any;
    catalog_name?: string;
    expect_pub_id?: string;
    detail?: string;
}

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    specType?: Entity | null,
    lastPubId?: string | null,
    noResponse?: boolean
) => {
    let matchData: CreateMatchData = {
        draft_id: draftId,
        catalog_name: catalogName,
        spec_type: specType ?? undefined,
        spec: draftSpec,
    };

    if (lastPubId) {
        matchData = { ...matchData, expect_pub_id: lastPubId };
    }

    return insertSupabase(TABLES.DRAFT_SPECS, matchData, noResponse);
};

export const modifyDraftSpec = (
    draftSpec: any,
    matchData: UpdateMatchData,
    catalogName?: string | null,
    lastPubId?: string | null,
    detail?: string
) => {
    let data: DraftSpecData = { spec: draftSpec };

    // The suggested catalog name generated by the discovery RPC must be overridden
    // in the capture edit workflow. An upgraded connector may alter the string
    // identifier the discover RPC will append to the task name (e.g., '/airbyte-source-hubspot'
    // for a v1 Hubspot connector vs. '/source-hubspot' for a v2 Hubspot connector).
    if (catalogName) {
        data = { ...data, catalog_name: catalogName };
    }

    if (lastPubId) {
        data = { ...data, expect_pub_id: lastPubId };
    }

    if (detail) {
        data = { ...data, detail };
    }

    return updateSupabase(TABLES.DRAFT_SPECS, data, matchData);
};

export const deleteDraftSpec = (draftId: string) => {
    return deleteSupabase(TABLES.DRAFT_SPECS, { draft_id: draftId });
};

// TODO (optimization | typing): Narrow the columns selected from the draft_specs_ext table.
//   More columns are selected than required to appease the typing of the editor store.
//   This function is used in the capture create and edit components.
export const getDraftSpecsBySpecType = async (
    draftId: string,
    specType: Entity
) => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DRAFT_SPECS_EXT)
                .select(`catalog_name,draft_id,expect_pub_id,spec,spec_type`)
                .eq('draft_id', draftId)
                .eq('spec_type', specType),
        'getDraftSpecsBySpecType'
    ).then(handleSuccess<DraftSpecQuery[]>, handleFailure);
};

interface DraftSpecsExtQuery_BySpecTypeReduced {
    draft_id: string;
    catalog_name: string;
    spec_type: string;
}

export const getDraftSpecsBySpecTypeReduced = async (
    draftId: string,
    specType: Entity
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DRAFT_SPECS_EXT)
                .select(`draft_id,catalog_name,spec_type`)
                .eq('draft_id', draftId)
                .eq('spec_type', specType),
        'getDraftSpecsBySpecTypeReduced'
    ).then(
        handleSuccess<DraftSpecsExtQuery_BySpecTypeReduced[]>,
        handleFailure
    );

    return data;
};

// TODO (optimization | typing): This is temporary typing given the supabase package upgrade will
//   considerably alter our approach to typing.
export interface DraftSpecsExtQuery_ByCatalogName {
    draft_id: string;
    catalog_name: string;
    spec_type: string;
    spec: any;
    expect_pub_id: string;
}

export const getDraftSpecsByCatalogName = async (
    draftId: string,
    catalogName: string,
    specType: Entity
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DRAFT_SPECS_EXT)
                .select(`draft_id,catalog_name,spec_type,spec,expect_pub_id`)
                .eq('draft_id', draftId)
                .eq('catalog_name', catalogName)
                .eq('spec_type', specType),
        'getDraftSpecsByCatalogName'
    ).then(handleSuccess<DraftSpecsExtQuery_ByCatalogName[]>, handleFailure);

    return data;
};

export const deleteDraftSpecsByCatalogName = async (
    draftId: string,
    specType: Entity,
    catalogNames: string[]
) => {
    if (catalogNames.length > 0) {
        // In case we get an absolutely massive amount of catalogs to delete,
        // we don't want to spam supabase
        const limiter = pLimit(3);
        const promises: Array<Promise<PostgrestSingleResponse<any>>> = [];
        let index = 0;

        // TODO (retry) promise generator
        const deletePromiseGenerator = (idx: number) => {
            return supabaseClient
                .from(TABLES.DRAFT_SPECS)
                .delete()
                .eq('draft_id', draftId)
                .eq('spec_type', specType)
                .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE));
        };

        // This could probably be written in a fancy functional-programming way with
        // clever calls to concat and map and slice and stuff,
        // but I want it to be dead obvious what's happening here.
        while (index < catalogNames.length) {
            // Have to do this to capture `index` correctly
            const prom = deletePromiseGenerator(index);
            promises.push(limiter(() => prom));

            index = index + CHUNK_SIZE;
        }

        const res = await Promise.all(promises);

        const errors = res.filter((r) => r.error);

        // TODO (unbound collections) This is hacky but it works
        //  We call this in 3 places (as of March 2023) and only one checks
        //  the response. It only checks for `error` so making this always return
        //  back an object with error. This way the typing is consistent.
        return {
            error: errors[0] ? errors[0].error : res[0].error,
        };
    } else {
        return {
            error: null,
        };
    }
};

export interface DraftSpecsExtQuery_ByDraftId {
    draft_id: string;
    catalog_name: string;
    spec_type: string;
    spec: any;
    expect_pub_id: string;
}

export const getDraftSpecsByDraftId = async (
    draftId: string,
    specType: Entity
) => {
    const data = await supabaseRetry(
        () =>
            supabaseClient
                .from(TABLES.DRAFT_SPECS_EXT)
                .select(`draft_id,catalog_name,spec_type,spec,expect_pub_id`)
                .eq('draft_id', draftId)
                .eq('spec_type', specType),
        'getDraftSpecsByDraftId'
    ).then(handleSuccess<DraftSpecsExtQuery_ByDraftId[]>, handleFailure);

    return data;
};

export const draftCollectionsEligibleForDeletion = async (
    capture_id: string,
    draft_id: string
) => {
    return supabaseRetry<PostgrestSingleResponse<void>>(
        () =>
            supabaseClient
                .rpc(RPCS.DRAFT_COLLECTIONS_ELIGIBLE_FOR_DELETION, {
                    capture_id,
                    draft_id,
                })
                .single(),
        'draftEligibleCollections'
    );
};
