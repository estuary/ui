import { PostgrestError } from '@supabase/postgrest-js';
import { TABLES } from 'services/supabase';
import { ENTITY } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

export interface LiveSpecsExtQuery {
    id: string;
    writes_to: string[];
    spec_type: string;
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
}

const defaultResponse: LiveSpecsExtQuery[] = [];
const queryColumns = ['id', 'writes_to', 'spec_type'];
const queryColumnsWithSpec = queryColumns.concat(['spec']);

type EntityID = string[] | string | null;

// TODO (typing) Initially this was all one function but something was messed up
//    with handling if/if not the spec was returned. So made two different wrapper
//     functions for the hook

function useLiveSpecsExt(
    draftId: EntityID,
    specType: ENTITY,
    includeSpec: true
): Response<LiveSpecsExtQueryWithSpec>;
function useLiveSpecsExt(
    draftId: EntityID,
    specType: ENTITY,
    includeSpec?: false
): Response<LiveSpecsExtQuery>;
function useLiveSpecsExt(
    draftId: EntityID,
    specType: ENTITY,
    includeSpec?: boolean
): Response<LiveSpecsExtQuery> | Response<LiveSpecsExtQueryWithSpec> {
    console.log('useLiveSpec');

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
    specType: ENTITY
): Response<LiveSpecsExtQueryWithSpec> {
    return useLiveSpecsExt(draftId, specType, true);
}

export function useLiveSpecsExtWithOutSpec(
    draftId: EntityID,
    specType: ENTITY
): Response<LiveSpecsExtQuery> {
    return useLiveSpecsExt(draftId, specType, false);
}

export function useLiveSpecsExtByLastPubId(
    lastPubId: EntityID,
    specType: ENTITY
): Response<LiveSpecsExtQuery> | Response<LiveSpecsExtQueryWithSpec> {
    console.log('useLiveSpecsExtByLastPubId');

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
