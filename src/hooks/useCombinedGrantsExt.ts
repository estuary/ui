import { Auth } from '@supabase/ui';
import { singleCallSettings } from 'context/SWR';
import { DEFAULT_FILTER, TABLES } from 'services/supabase';
import { Grants } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

const COMBINED_GRANTS_EXT_COLS = ['*'];

interface Props {
    adminOnly?: boolean;
    singleCall?: boolean;
}
const defaultResponse: Grants[] = [];

function useCombinedGrantsExt({ adminOnly, singleCall }: Props) {
    const { user } = Auth.useUser();

    const combinedGrantsExtQuery = useQuery<Grants>(
        TABLES.COMBINED_GRANTS_EXT,
        {
            columns: COMBINED_GRANTS_EXT_COLS,
            filter: (query) => {
                let queryBuilder = query;

                if (adminOnly) {
                    queryBuilder = queryBuilder.eq('capability', 'admin');
                }

                return queryBuilder.eq('user_id', user?.id ?? DEFAULT_FILTER);
            },
        },
        [adminOnly, singleCall]
    );

    const { data, error, mutate, isValidating } = useSelect(
        user?.id ? combinedGrantsExtQuery : null,
        singleCall ? singleCallSettings : undefined
    );

    return {
        combinedGrants: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useCombinedGrantsExt;
