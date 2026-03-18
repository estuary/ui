import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';
import type { AlertNode } from 'src/types/gql';

export type AlertsByCatalogName = { [catalogName: string]: AlertNode[] };
export type FlattenedGroupedAlerts = [string, AlertNode[]][];

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
