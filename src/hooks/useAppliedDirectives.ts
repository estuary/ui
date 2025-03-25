import type { DIRECTIVES } from 'directives/shared';
import type { AppliedDirective } from 'types';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getAppliedDirectives } from 'api/directives';
import { useMemo } from 'react';

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
