import { Auth } from '@supabase/ui';
import { TABLES } from 'services/supabase';
import { Grants } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

const COMBINED_GRANTS_EXT_COLS = ['*'];

interface Props {
    onlyAdmin?: boolean;
}

function useCombinedGrantsExt({ onlyAdmin }: Props) {
    const { user } = Auth.useUser();

    const combinedGrantsExtQuery = useQuery<Grants>(
        TABLES.COMBINED_GRANTS_EXT,
        {
            columns: COMBINED_GRANTS_EXT_COLS,
            filter: (query) => {
                let queryBuilder = query;

                if (onlyAdmin) {
                    queryBuilder = queryBuilder.eq('capability', 'admin');
                }

                return queryBuilder.eq('user_id', user?.id ?? '_unknown_');
            },
        },
        []
    );

    const { data, error, mutate, isValidating } = useSelect(
        combinedGrantsExtQuery
    );

    return {
        combinedGrants: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useCombinedGrantsExt;
