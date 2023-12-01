import { PostgrestError } from '@supabase/postgrest-js';
import { SelectableTableStore } from 'stores/Tables/Store';
import { PrefixSubscriptionDictionary } from 'utils/notification-utils';

export interface PrefixAlertTableState extends SelectableTableStore {
    hydrateContinuously: (
        data: PrefixSubscriptionDictionary,
        error?: PostgrestError
    ) => void;
}
