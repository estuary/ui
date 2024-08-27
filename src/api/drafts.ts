import { supabaseClient } from 'context/GlobalProviders';
import {
    deleteSupabase,
    handleFailure,
    handleSuccess,
    insertSupabase,
    supabaseRetry,
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
    id: string;
    detail: string;
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

    const data = await supabaseRetry(
        () => queryBuilder,
        'getDraftsByCatalogName'
    ).then(handleSuccess<DraftsQuery_ByCatalogName[]>, handleFailure);

    return data;
};

export { createEntityDraft, deleteEntityDraft, getDraftsByCatalogName };
