import { PostgrestError } from '@supabase/postgrest-js';
import { BillingRecord } from 'api/billing';
import { SelectableTableStore } from 'stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (
        data: BillingRecord[],
        error?: PostgrestError
    ) => void;
}
