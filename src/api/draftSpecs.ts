import { PostgrestResponse } from '@supabase/postgrest-js';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import pLimit from 'p-limit';
import {
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    supabaseClient,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Entity } from 'types';
import { CaptureDef, CaptureEndpoint } from '../../flow_deps/flow';

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
}

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    specType?: Entity | null,
    lastPubId?: string | null
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

    return insertSupabase(TABLES.DRAFT_SPECS, matchData);
};

export const modifyDraftSpec = (
    draftSpec: any,
    matchData: UpdateMatchData,
    catalogName?: string | null,
    lastPubId?: string | null
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

    return updateSupabase(TABLES.DRAFT_SPECS, data, matchData);
};

export const generateDraftSpec = (
    config: any,
    image: string,
    resources?: any
) => {
    // TODO (typing) MaterializationDef
    const draftSpec: any = {
        bindings: [],
        endpoint: {
            connector: {
                config,
                image,
            },
        },
    };

    if (resources) {
        Object.keys(resources).forEach((collectionName) => {
            const resourceConfig = resources[collectionName].data;

            if (Object.keys(resourceConfig).length > 0) {
                draftSpec.bindings.push({
                    source: collectionName,
                    resource: {
                        ...resourceConfig,
                    },
                });
            }
        });
    }

    return draftSpec;
};

export const generateCaptureDraftSpec = (
    endpoint: CaptureEndpoint,
    resourceConfig: ResourceConfigDictionary | null
): CaptureDef => {
    const draftSpec: CaptureDef = {
        bindings: [],
        endpoint,
    };

    if (resourceConfig) {
        Object.keys(resourceConfig).forEach((collectionName) => {
            const resources = resourceConfig[collectionName].data;

            if (Object.keys(resources).length > 0) {
                draftSpec.bindings.push({
                    target: collectionName,
                    resource: {
                        ...resources,
                    },
                });
            }
        });
    }

    return draftSpec;
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
    return supabaseClient
        .from(TABLES.DRAFT_SPECS_EXT)
        .select(`catalog_name,draft_id,expect_pub_id,spec,spec_type`)
        .eq('draft_id', draftId)
        .eq('spec_type', specType)
        .then(handleSuccess<DraftSpecQuery[]>, handleFailure);
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
    const data = await supabaseClient
        .from(TABLES.DRAFT_SPECS_EXT)
        .select(`draft_id,catalog_name,spec_type,spec,expect_pub_id`)
        .eq('draft_id', draftId)
        .eq('catalog_name', catalogName)
        .eq('spec_type', specType)
        .then(handleSuccess<DraftSpecsExtQuery_ByCatalogName[]>, handleFailure);

    return data;
};

const CHUNK_SIZE = 10;
export const deleteDraftSpecsByCatalogName = async (
    draftId: string,
    specType: Entity,
    catalogNames: string[]
) => {
    // In case we get an absolutely massive amount of catalogs to delete,
    // we don't want to spam supabase
    const limiter = pLimit(3);
    const promises: Array<Promise<PostgrestResponse<any>>> = [];
    let index = 0;

    const deletePromiseGenerator = (idx: number) =>
        supabaseClient
            .from(TABLES.DRAFT_SPECS)
            .delete()
            .eq('draft_id', draftId)
            .eq('spec_type', specType)
            .in('catalog_name', catalogNames.slice(idx, idx + CHUNK_SIZE));

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

    return errors[0] ?? res[0];
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
    const data = await supabaseClient
        .from(TABLES.DRAFT_SPECS_EXT)
        .select(`draft_id,catalog_name,spec_type,spec,expect_pub_id`)
        .eq('draft_id', draftId)
        .eq('spec_type', specType)
        .then(handleSuccess<DraftSpecsExtQuery_ByDraftId[]>, handleFailure);

    return data;
};
