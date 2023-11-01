import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { AlertSubscriptionsTableQuery } from 'api/alerts';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { AlertSubscription } from 'types';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';

interface Props {
    query: PostgrestFilterBuilder<AlertSubscriptionsTableQuery>;
}

function useNotificationSubscriptions({ query }: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<AlertSubscription>(query, extendedPollSettings);

    return {
        data: data ? formatNotificationSubscriptionsByPrefix(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationSubscriptions;
