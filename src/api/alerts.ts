import {
    defaultTableFilter,
    handleFailure,
    handleSuccess,
    insertSupabase,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { AlertMessage, AlertMethod } from 'types';

const createPendingAlertMethod = (
    detail: string,
    prefix: string,
    unverified_emails: string[]
) => {
    return insertSupabase(TABLES.ALERT_METHODS, {
        detail,
        prefix,
        unverified_emails,
    });
};

export type AlertMessageQuery = Pick<AlertMessage, 'id' | 'detail'>;

export type AlertMethodQuery = Pick<AlertMethod, 'id' | 'prefix'>;

export type AlertMethodTableQuery = Pick<
    AlertMethod,
    'id' | 'updated_at' | 'prefix' | 'unverified_emails' | 'verified_emails'
>;

const getAlertMessageByName = async (name: string) => {
    const data = await supabaseClient
        .from<AlertMessageQuery>(TABLES.ALERT_MESSAGES)
        .select(`id, detail`)
        .eq('detail', name)
        .then(handleSuccess<AlertMessageQuery[]>, handleFailure);

    return data;
};

const getAlertMethodByPrefix = async (prefix: string) => {
    const data = await supabaseClient
        .from<AlertMethodQuery>(TABLES.ALERT_METHODS)
        .select(`id, prefix`)
        .eq('prefix', `${prefix}/`)
        .then(handleSuccess<AlertMethodQuery[]>, handleFailure);

    return data;
};

const getPrefixAlertMethod = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<AlertMethodTableQuery>(TABLES.ALERT_METHODS)
        .select(
            `    
                id,
                updated_at,
                prefix,
                unverified_emails,
                verified_emails
            `,
            { count: 'exact' }
        );

    // TODO (alerts): Determine means to evaluate whether a key of the data type passed to defaultTableFilter is a compound type.
    //   Presently, only scalar types are able to be queried by the search bar.
    queryBuilder = defaultTableFilter<AlertMethodTableQuery>(
        queryBuilder,
        ['prefix'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

export {
    createPendingAlertMethod,
    getAlertMessageByName,
    getAlertMethodByPrefix,
    getPrefixAlertMethod,
};
