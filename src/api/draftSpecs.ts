import {
    deleteSupabase,
    insertSupabase,
    TABLES,
    updateSupabase,
} from 'services/supabase';
import { ENTITY } from 'types';

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    specType?: ENTITY | null
) => {
    return insertSupabase(TABLES.DRAFT_SPECS, {
        draft_id: draftId,
        catalog_name: catalogName,
        spec_type: specType ?? undefined,
        spec: draftSpec,
    });
};

export const updateDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any
) => {
    return updateSupabase(
        TABLES.DRAFT_SPECS,
        {
            spec: draftSpec,
        },
        {
            draft_id: draftId,
            catalog_name: catalogName,
        }
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
