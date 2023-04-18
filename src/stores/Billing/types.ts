import { StoreWithHydration } from 'stores/Hydration';
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

export interface BillingState extends StoreWithHydration {
    dataByTaskGraphDetails: DataVolumeByTaskGraphDetails;
    setDataByTaskGraphDetails: (value: ProjectedCostStats[]) => void;

    billingHistory: BillingRecord[];
    setBillingHistory: (value: ProjectedCostStats[]) => void;

    resetState: () => void;
}
