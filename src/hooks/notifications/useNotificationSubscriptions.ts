import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { AlertSubscriptionsExtendedQuery } from 'api/alerts';
import { extendedPollSettings } from 'context/SWR';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';

interface Props {
    query: any; // PostgrestFilterBuilder<AlertSubscriptionsExtendedQuery>;
}

function useNotificationSubscriptions({ query }: Props) {
    const { data, error, mutate, isValidating } = useQuery<
        AlertSubscriptionsExtendedQuery[]
    >(query, extendedPollSettings);

    return {
        data: data ? formatNotificationSubscriptionsByPrefix(data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationSubscriptions;
