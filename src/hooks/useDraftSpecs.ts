import { PostgrestError } from '@supabase/postgrest-js';
import { TABLES } from 'services/supabase';
import { KeyedMutator } from 'swr';
import { Entity } from 'types';
import { SuccessResponse, useQuery, useSelect } from './supabase-swr/';

export interface DraftSpecQuery {
    catalog_name: string;
    spec_type: string;
    spec: any;
    draft_id: string;
    expect_pub_id: string;
}

export interface DraftSpecSwrMetadata {
    draftSpecs: DraftSpecQuery[];
    error: PostgrestError | undefined;
    mutate: KeyedMutator<SuccessResponse<DraftSpecQuery>>;
    isValidating: boolean;
}

const DRAFT_SPEC_COLS = [
    'catalog_name',
    'spec_type',
    'spec',
    'draft_id',
    'expect_pub_id',
];
const defaultResponse: DraftSpecQuery[] = [];

function useDraftSpecs(
    draftId: string | null,
    lastPubId?: string | null,
    specType?: Entity | null
): DraftSpecSwrMetadata {
    const draftSpecQuery = useQuery<DraftSpecQuery>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPEC_COLS,
            filter: (query) => {
                let queryBuilder = query;

                if (lastPubId) {
                    queryBuilder = queryBuilder.eq('expect_pub_id', lastPubId);
                }

                if (specType) {
                    queryBuilder = queryBuilder.eq('spec_type', specType);
                }

                return queryBuilder.eq('draft_id', draftId as string);
            },
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftSpecQuery : null
    );

    return {
        draftSpecs: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecs;
