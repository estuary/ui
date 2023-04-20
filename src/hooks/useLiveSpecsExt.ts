import { PostgrestError } from '@supabase/postgrest-js';
import { TABLES } from 'services/supabase';
import { Entity } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

// TODO: Consider consolidating query interface instances.
export interface LiveSpecsExtQuery {
    id: string;
    last_pub_id: string;
    reads_from: string[];
    spec: any;
    spec_type: string;
    writes_to: string[];
}

// TODO (typing) don't just copy the settings from SWR/Supabase and just pick/extend 'em
interface Response<T> {
    error: PostgrestError | undefined;
    isValidating: boolean;
    liveSpecs: T[];
    mutate: any;
}

export interface LiveSpecsExtQueryWithSpec extends LiveSpecsExtQuery {
    catalog_name: string;
    detail: string;
    spec: any;
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
    const draftSpecQuery = useQuery<
        LiveSpecsExtQueryWithSpec | LiveSpecsExtQuery
    >(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: includeSpec ? queryColumnsWithSpec : queryColumns,
            filter: draftId
                ? (query) => {
                      const draftArray =
                          typeof draftId === 'string' ? [draftId] : draftId;

                      return query
                          .eq('spec_type', specType)
                          .or(`id.in.(${draftArray})`);
                  }
                : undefined,
        },
        [draftId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        draftId ? draftSpecQuery : null
    );

    return {
        liveSpecs: data ? data.data : defaultResponse,
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

// TODO (hooks) Leaving this here for now.
//      Starting to think of patterns for Supabase hooks to reduce duplication.
//      I am thinking something like this might work. Where you have a base hook
//      `useFooBar` and then there are "extensions" of that hook like
//      `useFooBarByFizzFuzz` or `useFooBarWithFizzBuzz`.
//      Not sure if these would all live in a file or folder or what.

export function useLiveSpecsExtByLastPubId(
    lastPubId: EntityID,
    specType: Entity
): Response<LiveSpecsExtQuery> | Response<LiveSpecsExtQueryWithSpec> {
    const draftSpecQuery = useQuery<
        LiveSpecsExtQueryWithSpec | LiveSpecsExtQuery
    >(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            filter: lastPubId
                ? (query) => {
                      const draftArray =
                          typeof lastPubId === 'string'
                              ? [lastPubId]
                              : lastPubId;

                      return query
                          .eq('spec_type', specType)
                          .or(`last_pub_id.in.(${draftArray})`);
                  }
                : undefined,
        },
        [lastPubId]
    );

    const { data, error, mutate, isValidating } = useSelect(
        lastPubId ? draftSpecQuery : null
    );

    return {
        liveSpecs: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}
