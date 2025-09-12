import type { PostgrestError } from '@supabase/postgrest-js';
import type { Entity } from 'src/types';

export interface AlertingOverviewProps {
    entityType: Entity;
    monthlyUsage?: number;
    monthlyUsageError?: PostgrestError;
    monthlyUsageIndeterminate?: boolean;
    monthlyUsageLoading?: boolean;
}
