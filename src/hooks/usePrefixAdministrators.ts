import type { Capability } from 'types';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { getPrefixAdministrators } from 'api/roleGrants';

function usePrefixAdministrators(objectRole: string, capability: Capability) {
    const { data, error, mutate, isValidating } = useQuery(
        getPrefixAdministrators(objectRole, capability)
    );

    return {
        data: data ? data.map(({ subject_role }) => subject_role) : [],
        error,
        mutate,
        isValidating,
    };
}

export default usePrefixAdministrators;
