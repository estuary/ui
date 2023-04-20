import { PostgrestError } from '@supabase/postgrest-js';
import { TABLES } from 'services/supabase';
import { KeyedMutator } from 'swr';
import { Entity } from 'types';
import { SuccessResponse, useQuery, useSelect } from './supabase-swr/';

export interface DraftSpecQuery {
    catalog_name: string;
    draft_id: string;
    expect_pub_id: string;
    spec: any;
    spec_type: string;
}

export interface DraftSpecSwrMetadata {
    draftSpecs: DraftSpecQuery[];
    error: PostgrestError | undefined;
    isValidating: boolean;
    mutate: KeyedMutator<SuccessResponse<DraftSpecQuery>>;
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
    options?: {
        catalogName?: string;
        lastPubId?: string;
        specType?: Entity;
    }
): DraftSpecSwrMetadata {
    const draftSpecQuery = useQuery<DraftSpecQuery>(
        TABLES.DRAFT_SPECS,
        {
            columns: DRAFT_SPEC_COLS,
            filter: (query) => {
                let queryBuilder = query;

                if (options) {
                    const { lastPubId, specType, catalogName } = options;

                    if (lastPubId) {
                        queryBuilder = queryBuilder.eq(
                            'expect_pub_id',
                            lastPubId
                        );
                    }

                    if (specType) {
                        queryBuilder = queryBuilder.eq('spec_type', specType);
                    }

                    if (catalogName) {
                        queryBuilder = queryBuilder.eq(
                            'catalog_name',
                            catalogName
                        );
                    }
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
