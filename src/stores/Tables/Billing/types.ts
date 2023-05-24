import { PostgrestError } from '@supabase/postgrest-js';
import { BillingRecord } from 'stores/Billing/types';
import { SelectableTableStore } from 'stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (
        data: BillingRecord[],
        error?: PostgrestError
    ) => void;
}
