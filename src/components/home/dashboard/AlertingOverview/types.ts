import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type { Alert } from 'src/types/gql';

export type AlertsByCatalogName = { [catalogName: string]: Alert[] };
export type FlattenedGroupedAlerts = [string, Alert[]][];

export interface AlertingOverviewProps {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}

export interface AlertSummaryProps {
    entityType: Entity;
    flattenedGroupedAlerts: FlattenedGroupedAlerts;
    fetching?: boolean;
}
