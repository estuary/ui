import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { PostgrestError, PostgrestResponse } from '@supabase/postgrest-js';
import { useMemo } from 'react';
import { supabaseClient, TABLES } from 'services/supabase';
import { KeyedMutator } from 'swr';
import { Entity, Schema } from 'types';

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
    mutate: KeyedMutator<PostgrestResponse<DraftSpecQuery>>;
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
].join(',');
const defaultResponse: DraftSpecQuery[] = [];

function useDraftSpecs(
    draftId: string | null,
    options?: {
        lastPubId?: string;
        specType?: Entity;
        catalogName?: string;
    }
): DraftSpecSwrMetadata {
    const draftSpecQuery = useMemo(() => {
        if (!draftId) {
            return null;
        }

        let queryBuilder = supabaseClient
            .from(TABLES.DRAFT_SPECS)
            .select(DRAFT_SPEC_COLS);

        if (options) {
            const { lastPubId, specType, catalogName } = options;

            if (lastPubId) {
                queryBuilder = queryBuilder.eq('expect_pub_id', lastPubId);
            }

            if (specType) {
                queryBuilder = queryBuilder.eq('spec_type', specType);
            }

            if (catalogName) {
                queryBuilder = queryBuilder.eq('catalog_name', catalogName);
            }
        }

        return queryBuilder.eq('draft_id', draftId).returns<DraftSpecQuery[]>();
    }, [draftId, options]);

    const { data, error, mutate, isValidating } = useQuery(draftSpecQuery);

    return {
        draftSpecs: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecs;
