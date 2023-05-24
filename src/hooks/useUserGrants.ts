import { Auth } from '@supabase/ui';
import { getUserGrants } from 'api/userGrants';
import { singleCallSettings } from 'context/SWR';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

interface Props {
    adminOnly?: boolean;
    singleCall?: boolean;
}

function useUserGrants({ adminOnly, singleCall }: Props) {
    const { user } = Auth.useUser();

    const { data, error, mutate, isValidating } = useSelectNew(
        user?.id ? getUserGrants(user.id, adminOnly) : null,
        singleCall ? singleCallSettings : undefined
    );

    return {
        userGrants: data ? data.data : [],
        error,
        mutate,
        isValidating,
    };
}

export default useUserGrants;
