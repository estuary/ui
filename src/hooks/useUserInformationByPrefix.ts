import { getUserInformationByPrefix } from 'api/combinedGrantsExt';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { Capability, Grants_User } from 'types';
import { hasLength } from 'utils/misc-utils';

function useUserInformationByPrefix(
    objectRole: string,
    capability: Capability
) {
    const { data, error, mutate, isValidating } = useSelectNew<Grants_User>(
        getUserInformationByPrefix([objectRole], capability)
    );

    return {
        data: data
            ? data.data.filter(({ user_email }) => hasLength(user_email))
            : [],
        error,
        mutate,
        isValidating,
    };
}

export default useUserInformationByPrefix;
