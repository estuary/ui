import type { PostgrestError } from '@supabase/postgrest-js';
import type { Invoice } from 'api/billing';
import type { SelectableTableStore } from 'stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (data: Invoice[], error?: PostgrestError) => void;
}
