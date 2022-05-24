import { insertSupabase, TABLES, updateSupabase } from 'services/supabase';
import { ENTITY } from 'types';

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    draftSpec: any,
    specType?: ENTITY | null // TODO (typing) get the spec types passed through properly
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
            draftSpec.bindings.push({
                source: collectionName,
                resource: {
                    ...resources[collectionName].data,
                },
            });
        });
    }

    return draftSpec;
};
