import type { PostgrestError } from '@supabase/postgrest-js';
import type { Invoice } from 'src/api/billing';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (data: Invoice[], error?: PostgrestError) => void;
}
