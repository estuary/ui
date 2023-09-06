import {
    defaultTableFilter,
    insertSupabase,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { AlertMethod } from 'types';

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

export type AlertMethodQuery = Pick<
    AlertMethod,
    'id' | 'updated_at' | 'prefix' | 'unverified_emails' | 'verified_emails'
>;

const getPrefixAlertMethod = (
    pagination: any,
    searchQuery: any,
    sorting: SortingProps<any>[]
) => {
    let queryBuilder = supabaseClient
        .from<AlertMethodQuery>(TABLES.ALERT_METHODS)
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
    queryBuilder = defaultTableFilter<AlertMethodQuery>(
        queryBuilder,
        ['prefix'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

export { createPendingAlertMethod, getPrefixAlertMethod };
