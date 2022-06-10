import { PostgrestError, PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    createClient,
    RealtimeSubscription,
    User,
} from '@supabase/supabase-js';
import { isEmpty } from 'lodash';
import { JobStatus } from 'types';

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

// Related to the AUth stuff
export const supabaseAuthError = 'error_description';
export const userNotFound = 'User not found';
export const foo = 'Confirmation+Token+not+found';

// Little helper string that fetches the name from open graph
export const CONNECTOR_NAME = `open_graph->en-US->>title`;
export const CONNECTOR_RECOMMENDED = `open_graph->en-US->>recommended`;
export const CONNECTOR_TITLE = `connector_open_graph->en-US->>title`;

export const ERROR_MESSAGES = {
    jwtExpired: 'JWT expired',
};

export const DEFAULT_FILTER = '__unknown__';

export enum TABLES {
    COMBINED_GRANTS_EXT = 'combined_grants_ext',
    CONNECTOR_TAGS = 'connector_tags',
    CONNECTORS = 'connectors',
    DISCOVERS = 'discovers',
    DRAFT_ERRORS = 'draft_errors',
    DRAFT_SPECS = 'draft_specs',
    DRAFT_SPECS_EXT = 'draft_specs_ext',
    DRAFTS = 'drafts',
    DRAFTS_EXT = 'drafts_ext',
    LIVE_SPEC_FLOW = 'live_spec_flow',
    LIVE_SPECS = 'live_specs',
    LIVE_SPECS_EXT = 'live_specs_ext',
    PUBLICATION_SPECS = 'publication_specs',
    PUBLICATION_SPECS_EXT = 'publication_specs_ext',
    PUBLICATIONS = 'publications',
    ROLE_GRANTS = 'role_grants',
    TASKS_BY_DAY = 'task_stats_by_day',
    TASKS_BY_HOUR = 'task_stats_by_hour',
    TASKS_BY_MINUTE = 'task_stats_by_minute',
    USER_GRANTS = 'user_grants',
}

export enum RPCS {
    VIEW_LOGS = 'view_logs',
}

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

export const DEFAULT_POLLING_INTERVAL = 500;

export const defaultTableFilter = <Data>(
    query: PostgrestFilterBuilder<Data>,
    searchParam: Array<keyof Data | any>, // TODO (typing) added any because of how Supabase handles keys. Hoping Supabase 2.0 fixes https://github.com/supabase/supabase-js/issues/170
    searchQuery: string | null,
    columnToSort: keyof Data,
    sortDirection: string,
    pagination?: { from: number; to: number }
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

    queryBuilder = queryBuilder.order(columnToSort, {
        ascending: sortDirection === 'asc',
    });

    if (pagination) {
        queryBuilder = queryBuilder.range(pagination.from, pagination.to);
    }

    return queryBuilder;
};

export const getUserDetails = (user: User | null) => {
    let userName, email, emailVerified, avatar;

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
    }

    return {
        userName,
        email,
        emailVerified,
        avatar,
    };
};

export interface CallSupabaseResponse {
    error?: PostgrestError;
    data: any;
}

const handleSuccess = (response: any) => {
    return response.error
        ? {
              data: null,
              error: response.error,
          }
        : {
              data: response.data,
          };
};

const handleFailure = (error: any) => {
    return {
        data: null,
        error,
    };
};

export const insertSupabase = (
    table: TABLES,
    data: any
): PromiseLike<CallSupabaseResponse> => {
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
): PromiseLike<CallSupabaseResponse> => {
    const query = supabaseClient.from(table);

    const makeCall = () => {
        return query
            .update(data)
            .match(matchData)
            .then(handleSuccess, handleFailure);
    };

    return makeCall();
};

export const endSubscription = (subscription: RealtimeSubscription) => {
    return supabaseClient
        .removeSubscription(subscription)
        .then(() => {})
        .catch(() => {});
};

export const endAllSubscriptions = () => {
    return supabaseClient
        .removeAllSubscriptions()
        .then(() => {})
        .catch(() => {});
};

export const startSubscription = (
    query: any,
    success: Function,
    failure: Function,
    keepSubscription?: boolean
) => {
    const subscription = query
        .on('*', async (payload: any) => {
            console.log('WS: ', payload);
            const response = payload.new
                ? payload.new
                : payload.record
                ? payload.record
                : null;
            if (response) {
                if (response.job_status.type !== 'queued') {
                    if (response.job_status.type === 'success') {
                        success(response);
                    } else {
                        failure(response);
                    }

                    if (!keepSubscription) {
                        await endSubscription(subscription);
                    }
                }
            } else {
                // TODO (error handling) Do not know how this path could happen but wanted to be safe
                failure(payload);
            }
        })
        .subscribe();

    return subscription;
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
