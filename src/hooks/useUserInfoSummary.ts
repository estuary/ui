import { getUserInfoSummary } from 'api/userInfoSummary';
import useSWR from 'swr';

function useUserInfoSummary() {
    return useSWR('useUserInfoSummary', () => getUserInfoSummary());
}

export default useUserInfoSummary;
