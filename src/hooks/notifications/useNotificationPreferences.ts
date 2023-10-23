import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { NotificationSubscriptionExt } from 'types';
import { condenseNotificationPreferences } from 'utils/notification-utils';

interface Props {
    query: PostgrestFilterBuilder<NotificationSubscriptionExt>;
}

function useNotificationPreferences({ query }: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<NotificationSubscriptionExt>(query, extendedPollSettings);

    return {
        data: data ? condenseNotificationPreferences(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationPreferences;
