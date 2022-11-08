import { Auth } from '@supabase/ui';
import { singleCallSettings } from 'context/SWR';
import { DIRECTIVES } from 'directives/shared';
import { DEFAULT_FILTER, TABLES } from 'services/supabase';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

function useAppliedDirectives(directive: keyof typeof DIRECTIVES) {
    const { user } = Auth.useUser();

    const appliedDirectivesQuery = useQuery<JoinedAppliedDirective>(
        TABLES.APPLIED_DIRECTIVES,
        {
            columns: `
                id,
                directive_id,
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

    const { data, error, mutate, isValidating } = useSelect(
        user?.id ? appliedDirectivesQuery : null,
        singleCallSettings
    );

    return {
        appliedDirective: data ? (data.data[0] as AppliedDirective<any>) : null,
        error,
        mutate,
        isValidating,
    };
}

export default useAppliedDirectives;
