import {
    PostgrestFilterBuilder,
    PostgrestResponse,
} from '@supabase/postgrest-js';

// from @supabase/postgrest-js/src/lib/PostgrestQueryBuilder.ts
export type Count = 'exact' | 'planned' | 'estimated';
export type Returning = 'minimal' | 'representation';

export type SuccessResponse<T> = Pick<
    PostgrestResponse<T>,
    'status' | 'statusText' | 'count'
> & {
    data: T[];
};

export type SuccessResponseSingle<T> = Pick<
    PostgrestResponse<T>,
    'status' | 'statusText' | 'count'
> & {
    data: T;
};

export type Filter<Data> = (
    query: PostgrestFilterBuilder<Data>
) => PostgrestFilterBuilder<Data>;

export type ToDistributedSuccessResponse<T> = T extends any
    ? SuccessResponse<T>
    : never;

export type ToPostgrestFilterBuilder<T> = T extends any
    ? PostgrestFilterBuilder<T>
    : never;

export type DistributedFilter<Data> = (
    query: ToPostgrestFilterBuilder<Data>
) => ToPostgrestFilterBuilder<Data>;
