import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import { getUserInfoSummary } from 'src/api/userInfoSummary';

function useUserInfoSummary() {
    return useQuery(getUserInfoSummary());
}

export default useUserInfoSummary;
