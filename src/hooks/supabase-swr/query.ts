import { Count, Filter } from './types';

export type QueryConfig<Data> = {
    columns?: string | string[];
    filter?: Filter<Data>;
    count?: Count;
    head?: boolean;
};
export type Query<Data> = [string | (() => string), QueryConfig<Data>] | null;

export const createQuery = <Data>(
    table: string,
    config: QueryConfig<Data>
): Query<Data> => [table, config];
