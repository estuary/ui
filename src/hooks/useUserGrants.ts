import { useUser } from 'context/UserContext';
import { getUserGrants } from 'api/userGrants';
import { singleCallSettings } from 'context/SWR';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

function useUserGrants(singleCall?: boolean) {
    const { session } = useUser();

    const { data, error, mutate, isValidating } = useQuery(
        session?.user.id ? getUserGrants(session.user.id) : null,
        singleCall ? singleCallSettings : undefined
    );

    return {
        userGrants: data ?? [],
        error,
        mutate,
        isValidating,
    };
}

export default useUserGrants;
