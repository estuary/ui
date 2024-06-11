import { getUserGrants } from 'api/userGrants';
import { singleCallSettings } from 'context/SWR';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { useUserStore } from 'context/User/useUserContextStore';

function useUserGrants(singleCall?: boolean) {
    const user = useUserStore((state) => state.user);

    const { data, error, mutate, isValidating } = useQuery(
        user?.id ? getUserGrants(user.id) : null,
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
