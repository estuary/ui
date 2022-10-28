import { Auth } from '@supabase/ui';
import { singleCallSettings } from 'context/SWR';
import { DIRECTIVES, DirectivesList } from 'directives/shared';
import { DEFAULT_FILTER, TABLES } from 'services/supabase';
import { AppliedDirective } from 'types';
import { useQuery, useSelect } from './supabase-swr/';

const defaultResponse: AppliedDirective[] = [];

function useAppliedDirectives(directives: DirectivesList) {
    const { user } = Auth.useUser();

    console.log('useAppliedDirectives', { directives });

    const appliedDirectivesQuery = useQuery<AppliedDirective>(
        TABLES.APPLIED_DIRECTIVES,
        {
            columns: ['*'],
            filter: (query) => {
                let queryBuilder = query;

                const directiveArray = directives.map((directive) => {
                    return DIRECTIVES[directive].id;
                });

                queryBuilder = queryBuilder.or(
                    `directive_id.in.(${directiveArray})`
                );

                return queryBuilder.eq('user_id', user?.id ?? DEFAULT_FILTER);
            },
        },
        []
    );

    const { data, error, mutate, isValidating } = useSelect(
        user?.id ? appliedDirectivesQuery : null,
        singleCallSettings
    );

    return {
        appliedDirectives: data ? data.data : defaultResponse,
        error,
        mutate,
        isValidating,
    };
}

export default useAppliedDirectives;
