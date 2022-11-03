import { Auth } from '@supabase/ui';
import { singleCallSettings } from 'context/SWR';
import { DIRECTIVES } from 'directives/shared';
import { DEFAULT_FILTER, TABLES } from 'services/supabase';
import { JoinedAppliedDirective } from 'types';
import { useQuery, useSelectSingle } from './supabase-swr/';

function useAppliedDirectives(directive: keyof typeof DIRECTIVES) {
    const { user } = Auth.useUser();

    console.log('useAppliedDirectives', { directive });

    const appliedDirectivesQuery = useQuery<JoinedAppliedDirective>(
        TABLES.APPLIED_DIRECTIVES,
        {
            columns: `
                job_status,
                    logs_token,
                    user_id,
                    user_claims,
                    updated_at,
                    directives !inner(spec->>type)
            `,
            filter: (query) => {
                let queryBuilder = query;

                queryBuilder = queryBuilder.eq(
                    'directives.spec->>type',
                    directive
                );
                queryBuilder = queryBuilder.eq(
                    'user_id',
                    user?.id ?? DEFAULT_FILTER
                );

                return DIRECTIVES[directive]
                    .queryFilter(queryBuilder)
                    .order('updated_at', { ascending: false })
                    .limit(1);
            },
        },
        []
    );

    const { data, error, mutate, isValidating } = useSelectSingle(
        user?.id ? appliedDirectivesQuery : null,
        singleCallSettings
    );

    console.log('data', data);

    return {
        appliedDirective: data ? data.data : null,
        error,
        mutate,
        isValidating,
    };
}

export default useAppliedDirectives;
