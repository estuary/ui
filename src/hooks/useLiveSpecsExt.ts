import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { PostgrestError } from '@supabase/postgrest-js';
import { supabaseClient } from 'context/GlobalProviders';
import { useMemo } from 'react';
import { TABLES } from 'services/supabase';
import { Entity } from 'types';

// TODO: Consider consolidating query interface instances.
export interface LiveSpecsExtQuery {
    id: string;
    spec: any;
    reads_from: string[];
    writes_to: string[];
    spec_type: Entity;
    last_pub_id: string;
}

export interface LiveSpecsExt_MaterializeOrTransform {
    catalog_name: string;
    spec_type: LiveSpecsExtQuery['spec_type'];
    writes_to: LiveSpecsExtQuery['writes_to'];
}

// TODO (typing) don't just copy the settings from SWR/Supabase and just pick/extend 'em
interface Response<T> {
    liveSpecs: T[];
    error: PostgrestError | undefined;
    mutate: any;
    isValidating: boolean;
}

export interface LiveSpecsExtQueryWithSpec extends LiveSpecsExtQuery {
    spec: any;
    catalog_name: string;
    detail: string;
}

const defaultResponse: LiveSpecsExtQuery[] = [];
const queryColumns = [
    'id',
    'spec',
    'writes_to',
    'reads_from',
    'spec_type',
    'last_pub_id',
];
const queryColumnsWithSpec = queryColumns.concat([
    'spec',
    'catalog_name',
    'detail',
]);
const queryColumnsQuery = queryColumns.join(',');
const queryColumnsWithSpecQuery = queryColumnsWithSpec.join(',');

type EntityID = string[] | string | null;

// TODO (typing) Initially this was all one function but something was messed up
//    with handling if/if not the spec was returned. So made two different wrapper
//     functions for the hook

function useLiveSpecsExt(
    draftId: EntityID,
    specType: Entity,
    includeSpec: true
): Response<LiveSpecsExtQueryWithSpec>;
function useLiveSpecsExt(
    draftId: EntityID,
    specType: Entity,
    includeSpec?: false
): Response<LiveSpecsExtQuery>;
function useLiveSpecsExt(
    draftId: EntityID,
    specType: Entity,
    includeSpec?: boolean
): Response<LiveSpecsExtQuery> | Response<LiveSpecsExtQueryWithSpec> {
    const draftSpecQuery = useMemo(() => {
        if (!draftId) {
            return null;
        }

        return supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(includeSpec ? queryColumnsWithSpecQuery : queryColumnsQuery)
            .eq('spec_type', specType)
            .or(`id.in.(${typeof draftId === 'string' ? [draftId] : draftId})`)
            .returns<LiveSpecsExtQueryWithSpec[] | LiveSpecsExtQuery[]>();
    }, [draftId, includeSpec, specType]);

    const { data, error, mutate, isValidating } = useQuery(draftSpecQuery);

    return {
        liveSpecs: data ?? defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export function useLiveSpecsExtWithSpec(
    draftId: EntityID,
    specType: Entity
): Response<LiveSpecsExtQueryWithSpec> {
    return useLiveSpecsExt(draftId, specType, true);
}

export function useLiveSpecsExtWithOutSpec(
    draftId: EntityID,
    specType: Entity
): Response<LiveSpecsExtQuery> {
    return useLiveSpecsExt(draftId, specType, false);
}

const liveSpecsExtRelatedColumns = ['catalog_name', 'reads_from', 'id'];
const liveSpecsExtRelatedQuery = liveSpecsExtRelatedColumns.join(',');
export interface LiveSpecsExt_Related {
    catalog_name: string;
    reads_from: string[];
    id: string;
}
export function useLiveSpecsExt_related(selected: string[]) {
    const { data, error, isValidating } = useQuery(
        supabaseClient
            .from(TABLES.LIVE_SPECS_EXT)
            .select(liveSpecsExtRelatedQuery)
            .eq('spec_type', 'materialization')
            .overlaps('reads_from', selected)
            .returns<LiveSpecsExt_Related[]>()
    );

    return {
        related: data ?? [],
        error,
        isValidating,
    };
}
