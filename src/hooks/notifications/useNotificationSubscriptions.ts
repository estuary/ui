import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { NotificationSubscriptionExt } from 'types';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';

interface Props {
    query: PostgrestFilterBuilder<NotificationSubscriptionExt>;
}

function useNotificationSubscriptions({ query }: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<NotificationSubscriptionExt>(query, extendedPollSettings);

    return {
        data: data ? formatNotificationSubscriptionsByPrefix(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationSubscriptions;
