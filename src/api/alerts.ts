import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    insertSupabase,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { NotificationMessage, NotificationPreference } from 'types';

const createNotificationMethod = (
    detail: string,
    prefix: string,
    user_id: string
) => {
    return insertSupabase(TABLES.NOTIFICATION_PREFERENCES, {
        detail,
        prefix,
        user_id,
    });
};

export type NotificationMessageQuery = Pick<
    NotificationMessage,
    'id' | 'detail'
>;

export type NotificationMethodQuery = Pick<
    NotificationPreference,
    'id' | 'prefix'
>;

export type NotificationPreferencesTableQuery = Pick<
    NotificationPreference,
    'id' | 'updated_at' | 'prefix' | 'user_id'
>;

const getNotificationMessageByName = async (name: string) => {
    const data = await supabaseClient
        .from<NotificationMessageQuery>(TABLES.NOTIFICATION_MESSAGES)
        .select(`id, detail`)
        .eq('detail', name)
        .then(handleSuccess<NotificationMessageQuery[]>, handleFailure);

    return data;
};

const getNotificationMethodByPrefix = async (prefix: string) => {
    const data = await supabaseClient
        .from<NotificationMethodQuery>(TABLES.NOTIFICATION_PREFERENCES)
        .select(`id, prefix`)
        .eq('prefix', `${prefix}/`)
        .then(handleSuccess<NotificationMethodQuery[]>, handleFailure);

    return data;
};

const getNotificationPreference = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<NotificationPreferencesTableQuery>(
            TABLES.NOTIFICATION_PREFERENCES
        )
        .select(
            `    
                id,
                updated_at,
                prefix,
                user_id
            `,
            { count: 'exact' }
        );

    // TODO (alerts): Determine means to evaluate whether a key of the data type passed to defaultTableFilter is a compound type.
    //   Presently, only scalar types are able to be queried by the search bar.
    queryBuilder = defaultTableFilter<NotificationPreferencesTableQuery>(
        queryBuilder,
        ['prefix'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

export {
    createNotificationMethod,
    getNotificationMessageByName,
    getNotificationMethodByPrefix,
    getNotificationPreference,
};
