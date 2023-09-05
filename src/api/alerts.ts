import {
    defaultTableFilter,
    SortingProps,
    supabaseClient,
    TABLES,
} from 'services/supabase';
import { AlertMethod } from 'types';

export type AlertMethodQuery = Pick<
    AlertMethod,
    'id' | 'updated_at' | 'prefix' | 'email'
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
                email
            `,
            { count: 'exact' }
        );

    queryBuilder = defaultTableFilter<AlertMethodQuery>(
        queryBuilder,
        ['prefix', 'email'],
        searchQuery,
        sorting,
        pagination
    );

    return queryBuilder;
};

export { getPrefixAlertMethod };
