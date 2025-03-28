import { PostgrestError } from '@supabase/postgrest-js';

import { Invoice } from 'src/api/billing';
import { SelectableTableStore } from 'src/stores/Tables/Store';

export interface BillingTableState extends SelectableTableStore {
    hydrateContinuously: (data: Invoice[], error?: PostgrestError) => void;
}
