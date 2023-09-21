import { PostgrestError } from '@supabase/postgrest-js';
import { Invoice } from 'api/billing';
import { SelectableTableStore } from 'stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (data: Invoice[], error?: PostgrestError) => void;
}
