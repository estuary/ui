import {
    deleteSupabase,
    insertSupabase,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import { ENTITY } from 'types';

interface CreateMatchData {
    draft_id: string | null;
    catalog_name: string;
    spec: any;
    spec_type?: ENTITY | null;
    expect_pub_id?: string;
}

interface UpdateMatchData {
    draft_id: string | null;
    catalog_name: string;
    expect_pub_id?: string;
}

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    specType?: ENTITY | null,
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

export const deleteDraftSpec = (draftId: string) => {
    return deleteSupabase(TABLES.DRAFT_SPECS, { draft_id: draftId });
};
