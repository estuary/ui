import {
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    supabaseClient,
    TABLES,
} from 'services/supabase';

const createEntityDraft = (entityName: string) => {
    return insertSupabase(TABLES.DRAFTS, {
        detail: entityName,
    });
};

const deleteEntityDraft = (draftId: string) => {
    return deleteSupabase(TABLES.DRAFTS, { id: draftId });
};

export interface DraftsQuery_ByCatalogName {
    detail: string;
    id: string;
    updated_at: string;
}

const getDraftsByCatalogName = async (
    catalogName: string,
    lastUpdatedOnly?: boolean
) => {
    let queryBuilder = supabaseClient
        .from(TABLES.DRAFTS)
        .select('id,detail,updated_at')
        .eq('detail', catalogName)
        .order('updated_at', { ascending: false });

    if (lastUpdatedOnly) {
        queryBuilder = queryBuilder.limit(1);
    }

    const data = await queryBuilder.then(
        handleSuccess<DraftsQuery_ByCatalogName[]>,
        handleFailure
    );

    return data;
};

export { createEntityDraft, deleteEntityDraft, getDraftsByCatalogName };
