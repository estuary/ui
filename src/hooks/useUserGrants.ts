import { useUser } from 'context/UserContext';
import { getUserGrants } from 'api/userGrants';
import { singleCallSettings } from 'context/SWR';
import { useSelectNew } from './supabase-swr/hooks/useSelect';

function useUserGrants(singleCall?: boolean) {
    const { session } = useUser();

    const { data, error, mutate, isValidating } = useSelectNew(
        session?.user?.id ? getUserGrants(session.user.id) : null,
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
