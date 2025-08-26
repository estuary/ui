import type {
    PostgrestError,
    PostgrestFilterBuilder,
    PostgrestResponse,
} from '@supabase/postgrest-js';
import type {
    JobStatus,
    SortDirection,
    SupabaseInvokeResponse,
} from 'src/types';

import { forEach } from 'lodash';
import retry from 'retry';

import { supabaseClient } from 'src/context/GlobalProviders';
import { logRocketEvent, retryAfterFailure } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

// Little helper string that fetches the name from open graph
export const QUERY_PARAM_CONNECTOR_TITLE = `connector_title->>en-US`;

export const SHARDS_DISABLE = `spec->shards->disable`;
export const TASK_STATS = `task_stats:flow_document->taskStats`;

export const SHARD_LABELS = `shard_labels:built_spec->shardTemplate->labels->labels`;

export const ENABLED_SHARDS = `spec->shards->disable.is.null`;

export const ERROR_MESSAGES = {
    jwtExpired: 'JWT expired',
    jwtInvalid: 'invalid JWT',
    jwsInvalid: 'JWSError JWSInvalidSignature',
    refreshInvalid: 'Refresh Token Not Found',
};

export const tokenHasIssues = (errorMessage?: string) => {
    return (
        errorMessage &&
        (errorMessage === ERROR_MESSAGES.jwtExpired ||
            errorMessage.includes(ERROR_MESSAGES.jwsInvalid) ||
            errorMessage.includes(ERROR_MESSAGES.jwtInvalid) ||
            errorMessage.includes(ERROR_MESSAGES.refreshInvalid))
    );
};

export const BASE_ERROR: PostgrestError = {
    code: '',
    details: '',
    hint: '',
    message: '',
    name: '',
};

export enum TABLES {
    ALERT_DATA_PROCESSING = 'alert_data_processing',
    ALERT_SUBSCRIPTIONS = 'alert_subscriptions',
    APPLIED_DIRECTIVES = 'applied_directives',
    CATALOG_STATS = 'catalog_stats',
    COMBINED_GRANTS_EXT = 'combined_grants_ext',
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DATA_PLANES = 'data_planes',
    DISCOVERS = 'discovers',
    DIRECTIVES = 'directives',
    DRAFT_ERRORS = 'draft_errors',
    DRAFT_SPECS = 'draft_specs',
    DRAFT_SPECS_EXT = 'draft_specs_ext',
    DRAFTS = 'drafts',
    DRAFTS_EXT = 'drafts_ext',
    EVOLUTIONS = 'evolutions',
    INFERRED_SCHEMAS = 'inferred_schemas',
    INVOICES_EXT = 'invoices_ext',
    LIVE_SPEC_FLOWS = 'live_spec_flows',
    LIVE_SPECS = 'live_specs',
    LIVE_SPECS_EXT = 'live_specs_ext',
    PUBLICATION_SPECS = 'publication_specs',
    PUBLICATION_SPECS_EXT = 'publication_specs_ext',
    PUBLICATIONS = 'publications',
    REFRESH_TOKENS = 'refresh_tokens',
    ROLE_GRANTS = 'role_grants',
    STORAGE_MAPPINGS = 'storage_mappings',
    TASKS_BY_DAY = 'task_stats_by_day',
    TASKS_BY_HOUR = 'task_stats_by_hour',
    TASKS_BY_MINUTE = 'task_stats_by_minute',
    TENANTS = 'tenants',
    USER_GRANTS = 'user_grants',
}

export enum RPCS {
    AUTH_ROLES = 'auth_roles',
    BILLING_REPORT = 'billing_report_202308',
    CREATE_REFRESH_TOKEN = 'create_refresh_token',
    DRAFT_COLLECTIONS_ELIGIBLE_FOR_DELETION = 'draft_collections_eligible_for_deletion',
    EXCHANGE_DIRECTIVES = 'exchange_directive_token',
    REPUBLISH_PREFIX = 'republish_prefix',
    USER_INFO_SUMMARY = 'user_info_summary',
    VIEW_LOGS = 'view_logs',
}

export enum FUNCTIONS {
    OAUTH = 'oauth',
    BILLING = 'billing',
}

// https://github.com/orgs/supabase/discussions/19651
const reservedWrapper = `%22`;
// eslint-disable-next-line no-useless-escape
const escapableWithbackSlash = /[\"\\]/g;
// eslint-disable-next-line no-useless-escape
const reservedCharacters = /[\,\.\(\)\:\"\\]/g;

// We need to escape some extra stuff
function encodeRFC3986URIComponent(str: string) {
    return encodeURIComponent(str).replace(
        // /[!'()*]/g,
        reservedCharacters,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

// TODO (PostgREST)
// A query of ilike.*,* will still fail. Not 100% sure why but this does make
//  things a bit safer.
export const escapeReservedCharacters = (val: string) => {
    // https://postgrest.org/en/v12/references/api/url_grammar.html#reserved-characters
    let wrapString = false;
    const cleanedVal = val.replace(reservedCharacters, (subString) => {
        if (subString.match(escapableWithbackSlash)) {
            return `\\${subString}`;
        } else {
            wrapString = true;
            return `${encodeRFC3986URIComponent(subString)}`;
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return wrapString
        ? `${reservedWrapper}${cleanedVal}${reservedWrapper}`
        : cleanedVal;
};

export interface SortingProps<Data> {
    col: keyof Data;
    direction: SortDirection;
}
export const DEFAULT_POLLING_INTERVAL = 750;
export type Pagination = { from: number; to: number };
export type Protocol<Data> = { column: keyof Data; value: string | null };

// TODO (V2 typing) - query should take in filter builder better
export const defaultTableFilter = <Response>(
    query: PostgrestFilterBuilder<any, any, any, any, any>,
    searchParam: Array<keyof Response | any>, // TODO (typing) added any because of how Supabase handles keys. Hoping Supabase 2.0 fixes https://github.com/supabase/supabase-js/issues/170
    searchQuery: string | null,
    sorting: SortingProps<Response>[],
    pagination?: Pagination,
    protocol?: Protocol<Response>
): PostgrestFilterBuilder<any, any, Response, any, any> => {
    let queryBuilder = query as PostgrestFilterBuilder<any, any, Response>;

    if (searchQuery) {
        queryBuilder = queryBuilder.or(
            searchParam
                .map((param) => {
                    return `${param}.ilike.*${escapeReservedCharacters(
                        searchQuery
                    )}*`;
                })
                .join(',')
        );
    }

    forEach(sorting, (sort) => {
        queryBuilder = queryBuilder.order(sort.col as string, {
            ascending: sort.direction === 'asc',
        });
    });

    if (pagination) {
        queryBuilder = queryBuilder.range(pagination.from, pagination.to);
    }

    if (protocol?.value) {
        queryBuilder = queryBuilder.filter(
            protocol.column as string,
            'eq',
            protocol.value
        );
    }

    return queryBuilder;
};

export interface CallSupabaseResponse<T> {
    error?: PostgrestError;
    data: T | null;
}

export const handleSuccess = <T>(response: any) =>
    response.error
        ? {
              data: null,
              error: response.error,
          }
        : {
              data: response.data as T,
          };

export const handleFailure = (error: any) => ({
    data: null,
    error,
});

// Retry calls
const RETRY_ATTEMPTS = 2;

export const supabaseRetry = <T>(makeCall: Function, action: string) => {
    const operation = retry.operation({
        retries: RETRY_ATTEMPTS,
        randomize: true,
        maxTimeout: 1500,
    });

    return new Promise<T>((resolve) => {
        operation.attempt(async () => {
            const response = await makeCall();

            const error = response.error;
            const {
                data: { session },
                error: authError,
            } = await supabaseClient.auth.getSession();

            // If we got an error that needs to force the user out sign them out
            if (
                tokenHasIssues(error?.message) &&
                (Boolean(session?.user) || authError)
            ) {
                logRocketEvent(
                    CustomEvents.SUPABASE_CALL_UNAUTHENTICATED,
                    error?.message ?? authError?.message ?? 'no error'
                );
                logRocketEvent(CustomEvents.AUTH_SIGNOUT, {
                    trigger: 'SupabaseRetry',
                });
                await supabaseClient.auth.signOut();
                return;
            }

            if (retryAfterFailure(error?.message) && operation.retry(error)) {
                logRocketEvent(CustomEvents.SUPABASE_CALL_FAILED, action);
                return;
            }

            resolve(response);
        });
    });
};

// Invoke supabase edge functions. Does not use the he
export function invokeSupabase<T>(fn: FUNCTIONS, body: any) {
    return supabaseRetry<SupabaseInvokeResponse<T>>(
        () =>
            supabaseClient.functions.invoke<T>(fn, {
                body: JSON.stringify(body),
            }),
        `fn:${fn}`
    );
}

export const insertSupabase = <T = any>(
    table: TABLES,
    data: any,
    noResponse?: boolean
): PromiseLike<CallSupabaseResponse<T>> => {
    return supabaseRetry(() => {
        const query = supabaseClient
            .from(table)
            .insert(Array.isArray(data) ? data : [data]);

        if (!noResponse) {
            return query.select();
        }

        return query;
    }, 'insert').then(handleSuccess<T>, handleFailure);
};

export const insertSupabase_noResponse = <T = any>(
    table: TABLES,
    data: any
): PromiseLike<CallSupabaseResponse<T>> => {
    return supabaseRetry(
        () =>
            supabaseClient
                .from(table)
                .insert(Array.isArray(data) ? data : [data]),
        'insert'
    ).then(handleSuccess<T>, handleFailure);
};

// Makes update calls. Mainly consumed in the src/api folder
export const updateSupabase = (
    table: TABLES,
    data: any,
    matchData: any
): PromiseLike<CallSupabaseResponse<any>> => {
    return supabaseRetry(
        () => supabaseClient.from(table).update(data).match(matchData).select(),
        'update'
    ).then(handleSuccess, handleFailure);
};

export const deleteSupabase = (
    table: TABLES,
    matchData: any
): PromiseLike<CallSupabaseResponse<any>> => {
    return supabaseRetry(
        () => supabaseClient.from(table).delete().match(matchData).select(),
        'delete'
    ).then(handleSuccess, handleFailure);
};

export const jobSucceeded = (jobStatus?: JobStatus) => {
    if (jobStatus) {
        if (jobStatus.type !== 'queued') {
            return jobStatus.type === 'success';
        } else {
            return null;
        }
    } else {
        return null;
    }
};

export const DEFAULT_PAGING_SIZE = 1000;

export type ParsedPagedFetchAllResponse<T> =
    | { data: T[] | null; error: null }
    | { data: null; error: PostgrestError };

export const parsePagedFetchAllResponse = <T>(
    responses: PostgrestResponse<T>[]
): ParsedPagedFetchAllResponse<T> => {
    const data = responses
        .filter((r) => r.data && r.data.length > 0)
        .flatMap((r) => (r.data === null ? [] : r.data));

    const error = responses
        .filter((r) => r.error)
        .flatMap((r) => (r.error === null ? [] : r.error));

    // If we got a single error then skip returning data and just
    //      return the error. This way an error page should show.
    if (error[0]) {
        return {
            error: error[0],
            data: null,
        };
    }

    return {
        error: null,
        data,
    };
};

export const pagedFetchAll = async <T>(
    pageSize: number,
    retryKey: string,
    fetcher: (start: number) => any //PostgrestFilterBuilder<any, any, T, any, any>
) => {
    const promises: Promise<PostgrestResponse<T>>[] = [];
    let hasMore = true;

    while (hasMore) {
        const currentCount = promises.length;
        const start = currentCount * pageSize;

        const prom = supabaseRetry<PostgrestResponse<T>>(
            () => fetcher(start),
            retryKey
        );
        promises.push(prom);

        // We need to know what the response is before starting another call
        //      so making this call from within the loop
        // eslint-disable-next-line no-await-in-loop
        const response = await prom;

        // Got nothing back (end of list OR error)
        //  or
        // Got less than the page size (end of list)
        if (!response.data || response.data.length < pageSize) {
            hasMore = false;
        }
    }

    const responses = await Promise.all(promises);

    return responses;
};

// START: Poller
export type PollerTimeout = number | undefined;
export const JOB_STATUS_POLLER_ERROR = 'supabase.poller.failed';
export const DEFAULT_POLLER_ERROR_TITLE_KEY = 'supabase.poller.failed.title';
export const DEFAULT_POLLER_ERROR_MESSAGE_KEY =
    'supabase.poller.failed.message';
export const DEFAULT_POLLER_ERROR = {
    title: DEFAULT_POLLER_ERROR_TITLE_KEY,
    error: {
        message: DEFAULT_POLLER_ERROR_MESSAGE_KEY,
    },
};

export const handlePollerError = (failedResponse: any) => {
    return failedResponse.error === JOB_STATUS_POLLER_ERROR
        ? DEFAULT_POLLER_ERROR.error
        : failedResponse.error
          ? failedResponse
          : null;
};

export const JOB_TYPE_EMPTY = 'emptyDraft';
export const JOB_TYPE_FAILURE = 'buildFailed';
export const JOB_TYPE_SUCCESS = 'success';

// These columns are not always what you want... but okay for a "default" constant
export const JOB_STATUS_FAILURE = [JOB_TYPE_FAILURE];
export const JOB_STATUS_SUCCESS = [JOB_TYPE_EMPTY, JOB_TYPE_SUCCESS];
export const JOB_STATUS_COLUMNS = `job_status, logs_token, id`;
// END: Poller
