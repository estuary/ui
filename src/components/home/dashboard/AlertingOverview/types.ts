import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type { Alert } from 'src/types/gql';

export type GroupedAlerts = { [catalogName: string]: Alert[] };
export type FilteredAndGroupedAlerts = [string, Alert[]][];

export interface AlertingOverviewProps {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

export interface AlertSummaryProps {
    entityType: Entity;
    filteredAndGroupedAlerts: FilteredAndGroupedAlerts;
    fetching?: boolean;
}
