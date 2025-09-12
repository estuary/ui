import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type { Alert } from 'src/types/gql';

export interface AlertingOverviewProps {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

export interface AlertSummaryProps {
    entityType: Entity;
    filteredDataArray: [string, Alert[]][];
    fetching?: boolean;
}
