import { Entity, Schema } from 'types';

import { KeyedMutator } from 'swr';

import { PostgrestError } from '@supabase/postgrest-js';

import { TABLES } from 'services/supabase';

import { SuccessResponse, useQuery, useSelect } from './supabase-swr/';

export interface DraftSpecQuery {
    catalog_name: string;
    spec_type: Entity;
    spec: any;
    draft_id: string;
    expect_pub_id: string;
    built_spec: Schema | null;
    validated: Schema | null;
}

export type DraftSpec = DraftSpecQuery | null;

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
    'built_spec',
    'validated',
];
const defaultResponse: DraftSpecQuery[] = [];

function useDraftSpecs(
    draftId: string | null,
    options?: {
        lastPubId?: string;
        specType?: Entity;
        catalogName?: string;
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
