import { getPrefixAdministrators } from 'api/roleGrants';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { BaseGrant, Capability } from 'types';

function usePrefixAdministrators(objectRole: string, capability: Capability) {
    const { data, error, mutate, isValidating } = useSelectNew<BaseGrant>(
        getPrefixAdministrators(objectRole, capability)
    );

    return {
        data: data ? data.data.map(({ subject_role }) => subject_role) : [],
        error,
        mutate,
        isValidating,
    };
}

export default usePrefixAdministrators;
