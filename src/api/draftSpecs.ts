import { callSupabase, TABLES } from 'services/supabase';

export const createDraftSpec = (
    draftId: string | null,
    catalogName: string,
    specType: 'materialization',
    draftSpec: any
) => {
    return callSupabase(TABLES.DRAFT_SPECS, [
        {
            draft_id: draftId,
            catalog_name: catalogName,
            spec_type: specType,
            spec: draftSpec,
        },
    ]);
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
