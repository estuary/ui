import { PostgrestError } from '@supabase/postgrest-js';
import { FormattedBillingRecord } from 'stores/Billing/types';
import { SelectableTableStore } from 'stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (
        data: FormattedBillingRecord[],
        error?: PostgrestError
    ) => void;
}
