import { PostgrestError } from '@supabase/postgrest-js';
import { SelectableTableStore } from 'stores/Tables/Store';
import { Entity, ProjectedCostStats } from 'types';

export interface ProjectedCostStatsDictionary {
    [date: string]: ProjectedCostStats[];
}

export interface BillingRecord {
    date: Date;
    dataVolume: number;
    taskCount: number;
    totalCost: number;
    pricingTier: string | null;
    taskRate: number | null;
    gbFree: number | null;
}

export interface DataVolumeByTask {
    date: Date;
    dataVolume: number;
    specType: Entity;
}

export interface DataVolumeByTaskGraphDetails {
    [catalog_name: string]: DataVolumeByTask[];
}

export interface BillingState extends SelectableTableStore {
    dataByTaskGraphDetails: DataVolumeByTaskGraphDetails;
    setDataByTaskGraphDetails: (value: ProjectedCostStats[]) => void;

    projectedCostStats: ProjectedCostStatsDictionary;
    setProjectedCostStats: (value: ProjectedCostStats[]) => void;

    billingHistory: BillingRecord[];
    setBillingHistory: () => void;

    hydrateContinuously: (
        data: BillingRecord[],
        error?: PostgrestError
    ) => void;

    resetBillingState: () => void;
}
