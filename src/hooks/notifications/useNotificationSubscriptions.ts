import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    AlertSubscriptionsExtendedQuery,
    getNotificationSubscriptions,
} from 'api/alerts';
import { extendedPollSettings, singleCallSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { AlertSubscription } from 'types';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';

interface Props {
    query?: PostgrestFilterBuilder<AlertSubscriptionsExtendedQuery>;
    poll?: boolean;
}

function useNotificationSubscriptions(options?: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<AlertSubscription>(
            options?.query ? options.query : getNotificationSubscriptions(),
            options?.poll ? extendedPollSettings : singleCallSettings
        );

    return {
        data: data ? formatNotificationSubscriptionsByPrefix(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationSubscriptions;
