import { PostgrestError } from '@supabase/postgrest-js';
import { SelectableTableStore } from 'stores/Tables/Store';
import { PrefixPreferenceDictionary } from 'utils/notification-utils';

export interface PrefixAlertTableState extends SelectableTableStore {
    hydrateContinuously: (
        data: PrefixPreferenceDictionary,
        error?: PostgrestError
    ) => void;
}
