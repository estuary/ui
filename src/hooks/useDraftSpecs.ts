import type { PostgrestError, PostgrestResponse } from '@supabase/postgrest-js';
import type { Entity, Schema } from 'src/types';
import type { KeyedMutator } from 'swr';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { supabaseClient } from 'src/context/GlobalProviders';
import { TABLES } from 'src/services/supabase';

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
    entity: Entity
): DraftSpecSwrMetadata {
    const { data, error, mutate, isValidating } = useQuery(
        !draftId
            ? null
            : supabaseClient
                  .from(TABLES.DRAFT_SPECS)
                  .select(DRAFT_SPEC_COLS)
                  .eq('draft_id', draftId)
                  .eq('spec_type', entity)
                  .returns<DraftSpecQuery[]>()
    );

    return {
        draftSpecs: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export function useDraftSpecs_editWorkflow(
    draftId: string | null,
    lastPubId?: string
): DraftSpecSwrMetadata {
    const { data, error, mutate, isValidating } = useQuery(
        !draftId || !lastPubId
            ? null
            : supabaseClient
                  .from(TABLES.DRAFT_SPECS)
                  .select(DRAFT_SPEC_COLS)
                  .eq('expect_pub_id', lastPubId)
                  .eq('draft_id', draftId)
                  .returns<DraftSpecQuery[]>()
    );

    return {
        draftSpecs: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export function useDraftSpecs_forEditor(
    draftId: string | null,
    specType: Entity,
    catalogName: string | undefined
): DraftSpecSwrMetadata {
    const { data, error, mutate, isValidating } = useQuery(
        !draftId || !catalogName
            ? null
            : supabaseClient
                  .from(TABLES.DRAFT_SPECS)
                  .select(DRAFT_SPEC_COLS)
                  .eq('spec_type', specType)
                  .eq('catalog_name', catalogName)
                  .eq('draft_id', draftId)
                  .returns<DraftSpecQuery[]>()
    );

    return {
        draftSpecs: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useDraftSpecs;
