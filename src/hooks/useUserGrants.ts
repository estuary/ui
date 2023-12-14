import { Auth } from '@supabase/ui';
import { getUserGrants } from 'api/userGrants';
import { singleCallSettings } from 'context/SWR';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

interface Props {
    adminOnly?: boolean;
    singleCall?: boolean;
}

function useUserGrants({ adminOnly, singleCall }: Props) {
    const { session } = Auth.useUser();

    const { data, error, mutate, isValidating } = useSelectNew(
        session?.user?.id ? getUserGrants(session.user.id, adminOnly) : null,
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
