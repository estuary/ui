import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { extendedPollSettings } from 'context/SWR';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
import { NotificationPreferenceExt } from 'types';
import { condenseNotificationPreferences } from 'utils/notification-utils';

interface Props {
    query: PostgrestFilterBuilder<NotificationPreferenceExt>;
}

function useNotificationPreferences({ query }: Props) {
    const { data, error, mutate, isValidating } =
        useSelectNew<NotificationPreferenceExt>(query, extendedPollSettings);

    return {
        data: data ? condenseNotificationPreferences(data.data) : {},
        error,
        mutate,
        isValidating,
    };
}

export default useNotificationPreferences;
