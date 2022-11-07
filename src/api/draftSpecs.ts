import { DraftSpecQuery } from 'hooks/useDraftSpecs';
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
}

interface DraftSpecData {
    spec: any;
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

export const updateDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    lastPubId?: string | null
) => {
    let matchData: UpdateMatchData = {
        draft_id: draftId,
        catalog_name: catalogName,
    };

    if (lastPubId) {
        matchData = { ...matchData, expect_pub_id: lastPubId };
    }

    return updateSupabase(
        TABLES.DRAFT_SPECS,
        {
            spec: draftSpec,
        },
        matchData
    );
};

// TODO (optimization): Determine whether to replace all instances of updateDraftSpec
//   with this modified and extendible version of that function. If that is desired,
//   rename the function below to updateDraftSpec and remove the existing function.
export const modifyDraftSpec = (
    draftSpec: any,
    matchData: UpdateMatchData,
    lastPubId?: string
) => {
    let data: DraftSpecData = { spec: draftSpec };

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
    resourceConfig: ResourceConfigDictionary,
    endpoint: CaptureEndpoint
): CaptureDef => {
    const draftSpec: CaptureDef = {
        bindings: [],
        endpoint,
    };

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

export const deleteDraftSpecsByCatalogName = (
    draftId: string,
    catalogNames: string[]
) => {
    return supabaseClient
        .from(TABLES.DRAFT_SPECS)
        .delete()
        .eq('draft_id', draftId)
        .in('catalog_name', catalogNames);
};
