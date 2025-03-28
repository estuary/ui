import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getUserInformationByPrefix } from 'src/api/combinedGrantsExt';
import { Capability, Grant_UserExt } from 'src/types';

function useUserInformationByPrefix(
    objectRoles: string[],
    capability: Capability
) {
    const { data, error, mutate, isValidating } = useQuery<Grant_UserExt>(
        getUserInformationByPrefix(objectRoles, capability)
    );

    return {
        data: data ?? [],
        error,
        mutate,
        isValidating,
    };
}

export default useUserInformationByPrefix;
