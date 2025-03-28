import { useMemo } from 'react';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getAppliedDirectives } from 'src/api/directives';
import { DIRECTIVES } from 'src/directives/shared';
import { AppliedDirective } from 'src/types';

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
