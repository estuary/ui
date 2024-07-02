import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getAppliedDirectives } from 'api/directives';
import { DIRECTIVES } from 'directives/shared';
import { useMemo } from 'react';
import { AppliedDirective } from 'types';

function useAppliedDirectives(type: keyof typeof DIRECTIVES, token?: string) {
    const { data, error, mutate, isValidating } = useQuery(
        getAppliedDirectives(type, token)
    );

    return useMemo(
        () => ({
            appliedDirective: data
                ? (data[0] as AppliedDirective<any> | undefined)
                : null,
            error,
            mutate,
            isValidating,
        }),
        [data, error, isValidating, mutate]
    );
}

export default useAppliedDirectives;
