import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { AlertSubscriptionsExtendedQuery } from 'api/alerts';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';

interface Props {
    query: PostgrestFilterBuilder<AlertSubscriptionsExtendedQuery>;
}

function useNotificationSubscriptions({ query }: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<AlertSubscriptionsExtendedQuery>(
            query,
            extendedPollSettings
        );

    return {
        data: data ? formatNotificationSubscriptionsByPrefix(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationSubscriptions;
