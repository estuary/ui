import { getUserInformationByPrefix } from 'api/combinedGrantsExt';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { Capability, Grant_UserExt } from 'types';

// TODO (optimization): The combined_grants_ext view limits the function of this hook. The original intent of the hook
//   is to return information (email, full name, avatar URL, and user ID) for all administrators of a tenant, including users
//   who have administrative access via a prefix privilege (e.g., user A is an admin of tenantB/ because tenantA/ has admin access
//   to that prefix).
function useUserInformationByPrefix(
    objectRoles: string[],
    capability: Capability
) {
    const { data, error, mutate, isValidating } = useSelectNew<Grant_UserExt>(
        getUserInformationByPrefix(objectRoles, capability)
    );

    return {
        data: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useUserInformationByPrefix;
