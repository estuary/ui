import {
    PostgrestResponse,
    PostgrestSingleResponse,
    SupabaseClient,
} from '@supabase/supabase-js';
import { useMemo } from 'react';
import { QueryConfig } from '../query';
import useClient from './useClient';

export enum FetcherType {
    MULTIPLE = 'multiple',
    SINGLE = 'single',
    MAYBE_SINGLE = 'maybeSingle',
    CSV = 'csv',
}

export type Fetcher<Data> = (
    table: string,
    config: QueryConfig<Data>
) => Promise<PostgrestResponse<Data>>;

export type FetcherSingle<Data> = (
    table: string,
    config: QueryConfig<Data>
) => Promise<PostgrestSingleResponse<Data>>;

function createFetcher<Data>(
    client: SupabaseClient,
    type: FetcherType.MAYBE_SINGLE
): FetcherSingle<Data | null>;

function createFetcher<Data>(
    client: SupabaseClient,
    type: FetcherType.SINGLE | FetcherType.CSV
): FetcherSingle<Data>;

function createFetcher<Data>(
    client: SupabaseClient,
    type: FetcherType.MULTIPLE
): Fetcher<Data>;

function createFetcher(client: SupabaseClient, type: FetcherType) {
    console.log('createFetcher');
    return async (table: string, config: QueryConfig<any>) => {
        console.log('createFetcher async');
        const select = client.from(table).select(config.columns, {
            count: config.count,
            head: config.head,
        });

        const query =
            config.filter && typeof config.filter === 'function'
                ? config.filter(select)
                : select;

        switch (type) {
            case 'multiple':
                return query.throwOnError();
            case 'single':
                return query.throwOnError().single();
            case 'maybeSingle':
                return query.throwOnError().maybeSingle();
            case 'csv':
                return query.throwOnError().csv();
            default:
                return query.throwOnError();
        }
    };
}

function useFetcher<Data>(type: FetcherType.MULTIPLE): Fetcher<Data>;
function useFetcher<Data>(type: FetcherType.SINGLE): FetcherSingle<Data>;
function useFetcher<Data>(
    type: FetcherType.MAYBE_SINGLE
): FetcherSingle<Data | null>;
function useFetcher(type: FetcherType.CSV): FetcherSingle<string>;

function useFetcher(type: FetcherType) {
    const client = useClient();
    console.log('useFetcher', {
        client,
        type,
    });
    return useMemo(() => {
        console.log('useFetcher memo');
        return createFetcher(client, type as any);
    }, [client, type]) as any;
}

export default useFetcher;
