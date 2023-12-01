import { getUserInformationByPrefix } from 'api/combinedGrantsExt';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { Capability, Grant_UserExt } from 'types';

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
