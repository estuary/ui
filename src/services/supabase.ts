import { PostgrestError, PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, User } from '@supabase/supabase-js';
import { ToPostgrestFilterBuilder } from 'hooks/supabase-swr';
import { forEach, isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { JobStatus, SortDirection } from 'types';
import { hasLength, incrementInterval, timeoutCleanUp } from 'utils/misc-utils';

if (
    !process.env.REACT_APP_SUPABASE_URL ||
    !process.env.REACT_APP_SUPABASE_ANON_KEY
) {
    throw new Error(
        'You must set the Supabase url and anon key in the env settings.'
    );
}

const supabaseSettings = {
    url: process.env.REACT_APP_SUPABASE_URL,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
};

// Little helper string that fetches the name from open graph
export const CONNECTOR_NAME = `title->>en-US`;
export const CONNECTOR_RECOMMENDED = `recommended`;
export const CONNECTOR_TITLE = `title:connector_title->>en-US`;
export const CONNECTOR_IMAGE = `image:connector_logo_url->>en-US`;

export const QUERY_PARAM_CONNECTOR_TITLE = `connector_title->>en-US`;

export const ERROR_MESSAGES = {
    jwtExpired: 'JWT expired',
};

export const DEFAULT_FILTER = '__unknown__';

export enum TABLES {
    APPLIED_DIRECTIVES = 'applied_directives',
    CATALOG_STATS = 'catalog_stats',
    COMBINED_GRANTS_EXT = 'combined_grants_ext',
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DISCOVERS = 'discovers',
    DIRECTIVES = 'directives',
    DRAFT_ERRORS = 'draft_errors',
    DRAFT_SPECS = 'draft_specs',
    DRAFT_SPECS_EXT = 'draft_specs_ext',
    DRAFTS = 'drafts',
    DRAFTS_EXT = 'drafts_ext',
    EVOLUTIONS = 'evolutions',
    LIVE_SPEC_FLOW = 'live_spec_flow',
    LIVE_SPECS = 'live_specs',
    LIVE_SPECS_EXT = 'live_specs_ext',
    PUBLICATION_SPECS = 'publication_specs',
    PUBLICATION_SPECS_EXT = 'publication_specs_ext',
    PUBLICATIONS = 'publications',
    ROLE_GRANTS = 'role_grants',
    STORAGE_MAPPINGS = 'storage_mappings',
    TASKS_BY_DAY = 'task_stats_by_day',
    TASKS_BY_HOUR = 'task_stats_by_hour',
    TASKS_BY_MINUTE = 'task_stats_by_minute',
    TENANTS = 'tenants',
    USER_GRANTS = 'user_grants',
}

export enum RPCS {
    EXCHANGE_DIRECTIVES = 'exchange_directive_token',
    VIEW_LOGS = 'view_logs',
    CREATE_REFRESH_TOKEN = 'create_refresh_token',
}

export enum FUNCTIONS {
    OAUTH = 'oauth',
    BILLING = 'billing',
}

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey,
    {
        // TODO (realtime) This is temporary until we figure out why some
        //      subscriptions just hang forever.
        realtime: {
            logger: (kind: string, msg: string, data?: any) => {
                LogRocket.log('Realtime : ', kind, msg, data);
            },
        },
    }
);

export interface SortingProps<Data> {
    col: keyof Data;
    direction: SortDirection;
}
export const DEFAULT_POLLING_INTERVAL = 750;
export type Pagination = { from: number; to: number };
export type Protocol<Data> = { column: keyof Data; value: string | null };
export const defaultTableFilter = <Data>(
    query: PostgrestFilterBuilder<Data>,
    searchParam: Array<keyof Data | any>, // TODO (typing) added any because of how Supabase handles keys. Hoping Supabase 2.0 fixes https://github.com/supabase/supabase-js/issues/170
    searchQuery: string | null,
    sorting: SortingProps<Data>[],
    pagination?: Pagination,
    protocol?: Protocol<Data>
) => {
    let queryBuilder = query;

    if (searchQuery) {
        queryBuilder = queryBuilder.or(
            searchParam
                .map((param) => {
                    return `${param}.ilike.*${searchQuery}*`;
                })
                .join(',')
        );
    }

    forEach(sorting, (sort) => {
        queryBuilder = queryBuilder.order(sort.col, {
            ascending: sort.direction === 'asc',
        });
    });

    if (pagination) {
        queryBuilder = queryBuilder.range(pagination.from, pagination.to);
    }

    if (protocol?.value) {
        queryBuilder = queryBuilder.filter(
            protocol.column,
            'eq',
            protocol.value
        );
    }

    return queryBuilder;
};

export const distributedTableFilter = <Data>(
    query: ToPostgrestFilterBuilder<Data>,
    searchParam: Array<keyof Data | any>, // TODO (typing) added any because of how Supabase handles keys. Hoping Supabase 2.0 fixes https://github.com/supabase/supabase-js/issues/170
    searchQuery: string | null,
    sorting: SortingProps<Data>[],
    pagination?: Pagination,
    protocol?: Protocol<Data>
) => {
    let queryBuilder = query;

    if (searchQuery) {
        queryBuilder = queryBuilder.or(
            searchParam
                .map((param) => {
                    return `${param}.ilike.*${searchQuery}*`;
                })
                .join(',')
        );
    }

    forEach(sorting, (sort) => {
        queryBuilder = queryBuilder.order(sort.col, {
            ascending: sort.direction === 'asc',
        });
    });

    if (pagination) {
        queryBuilder = queryBuilder.range(pagination.from, pagination.to);
    }

    if (protocol?.value) {
        queryBuilder = queryBuilder.filter(
            protocol.column,
            'eq',
            protocol.value
        );
    }

    return queryBuilder;
};

export const getUserDetails = (user: User | null) => {
    let userName, email, emailVerified, avatar, id;

    if (user) {
        if (!isEmpty(user.user_metadata)) {
            userName = user.user_metadata.full_name;
            email = user.user_metadata.email;
            emailVerified = user.user_metadata.email_verified;
            avatar = user.user_metadata.avatar_url;
        } else {
            userName = user.email;
            email = user.email;
            emailVerified = false;
        }

        id = user.id;
    }

    return {
        id,
        userName,
        email,
        emailVerified,
        avatar,
    };
};

export interface CallSupabaseResponse<T> {
    error?: PostgrestError;
    data: T | null;
}

export const handleSuccess = <T>(response: any) => {
    return response.error
        ? {
              data: null,
              error: response.error,
          }
        : {
              data: response.data as T,
          };
};

export const handleFailure = (error: any) => {
    return {
        data: null,
        error,
    };
};

export const insertSupabase = (
    table: TABLES,
    data: any
): PromiseLike<CallSupabaseResponse<any>> => {
    const query = supabaseClient.from(table);

    const makeCall = () => {
        return query.insert([data]).then(handleSuccess, handleFailure);
    };

    return makeCall();
};

// Makes update calls. Mainly consumed in the src/api folder
export const updateSupabase = (
    table: TABLES,
    data: any,
    matchData: any
): PromiseLike<CallSupabaseResponse<any>> => {
    const query = supabaseClient.from(table);

    const makeCall = () => {
        return query
            .update(data)
            .match(matchData)
            .then(handleSuccess, handleFailure);
    };

    return makeCall();
};

export const deleteSupabase = (
    table: TABLES,
    matchData: any
): PromiseLike<CallSupabaseResponse<any>> => {
    const query = supabaseClient.from(table);

    const makeCall = () => {
        return query
            .delete()
            .match(matchData)
            .then(handleSuccess, handleFailure);
    };

    return makeCall();
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

// START: Poller
type PollerTimeout = number | undefined;

export const JOB_STATUS_POLLER_ERROR = 'supabase.poller.failed';

// These columns are not always what you want... but okay for a "default" constant
export const JOB_STATUS_COLUMNS = `job_status, logs_token, id`;
export const jobStatusPoller = (
    query: any,
    success: Function,
    failure: Function,
    initWait?: number
) => {
    let pollerTimeout: PollerTimeout;
    let interval = DEFAULT_POLLING_INTERVAL;
    const makeApiCall = () => {
        LogRocket.log('Poller : start ');

        return query.throwOnError().then(
            (payload: any) => {
                LogRocket.log('Poller : response : ', payload);
                timeoutCleanUp(pollerTimeout);

                if (payload.error) {
                    failure(handleFailure(payload.error));
                } else {
                    const response =
                        (payload &&
                            hasLength(payload.data) &&
                            payload.data[0]) ??
                        null;
                    if (
                        response?.job_status?.type &&
                        response.job_status.type !== 'queued'
                    ) {
                        LogRocket.log(
                            `Poller : response : ${response.job_status.type}`
                        );
                        if (response.job_status.type === 'success') {
                            success(response);
                        } else {
                            failure(response);
                        }
                    } else {
                        interval = incrementInterval(interval);
                        pollerTimeout = window.setTimeout(
                            makeApiCall,
                            interval
                        );
                    }
                }
            },
            (error: unknown) => {
                LogRocket.log('Poller : error : ', error);
                timeoutCleanUp(pollerTimeout);
                failure(handleFailure(JOB_STATUS_POLLER_ERROR));
            }
        );
    };

    pollerTimeout = window.setTimeout(
        makeApiCall,
        initWait ?? DEFAULT_POLLING_INTERVAL * 2
    );
};
// END: Poller

// DO NOT USE WITHOUT TALKING TO SOMEONE
// TODO (Realtime) - fix the "hanging" isue where realtime does not always come back with a response
//  We have found some weird issues with the RealTime stuff
//  Eventually we want to go back to this but need to research the issues first.

// export const endSubscription = (subscription: RealtimeSubscription) => {
//     return supabaseClient
//         .removeSubscription(subscription)
//         .then(() => {})
//         .catch(() => {});
// };

// export const startSubscription = (
//     query: SupabaseQueryBuilder<any>,
//     success: Function,
//     failure: Function,
//     keepSubscription?: boolean
// ) => {
//     const subscription = query
//         .on('*', async (payload: any) => {
//             const response = payload.new
//                 ? payload.new
//                 : // TODO (typing) during manual testing I have seen record be in the response
//                 //      even though the type says it is not there. Needs more research
//                 // eslint-disable-next-line @typescript-eslint/dot-notation
//                 payload['record']
//                 ? // eslint-disable-next-line @typescript-eslint/dot-notation
//                   payload['record']
//                 : null;

//             if (response) {
//                 if (response.job_status.type !== 'queued') {
//                     if (response.job_status.type === 'success') {
//                         success(response);
//                     } else {
//                         failure(response);
//                     }

//                     if (!keepSubscription) {
//                         await endSubscription(subscription);
//                     }
//                 }
//             } else {
//                 // TODO (error handling) Do not know how this path could happen but wanted to be safe
//                 failure(payload);
//             }
//         })
//         .subscribe();

//     return subscription;
// };
// DO NOT USE WITHOUT TALKING TO SOMEONE

// Invoke supabase edge functions.
export function invokeSupabase<T>(fn: FUNCTIONS, body: any) {
    return supabaseClient.functions.invoke<T>(fn, {
        body: JSON.stringify(body),
    });
}
