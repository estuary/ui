import { Count, DistributedFilter, Filter } from './types';

export type QueryConfig<Data> = {
    columns?: string | string[];
    count?: Count;
    filter?: Filter<Data>;
    head?: boolean;
};
export type Query<Data> = [string, QueryConfig<Data>] | null;

export const createQuery = <Data>(
    table: string,
    config: QueryConfig<Data>
): Query<Data> => [table, config];

export type DistributedQueryConfig<Data> = {
    columns?: string | string[];
    count?: Count;
    filter?: DistributedFilter<Data>;
    head?: boolean;
};

export type DistributedQuery<Data> =
    | [string, DistributedQueryConfig<Data>]
    | null;

export type ToDistributedQuery<T> = T extends any ? DistributedQuery<T> : never;

export const createDistributedQuery = <Data>(
    table: string,
    config: DistributedQueryConfig<Data>
): ToDistributedQuery<Data> => [table, config] as ToDistributedQuery<Data>;
