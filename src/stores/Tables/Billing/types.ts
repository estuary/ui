import { SelectableTableStore } from 'stores/Tables/Store';
import { Entity, ProjectedCostStats } from 'types';

export interface ProjectedCostStatsDictionary {
    [date: string]: ProjectedCostStats[];
}

export interface BillingDetails {
    date: Date;
    dataVolume: number;
    taskCount: number;
    totalCost: number;
    pricingTier: string | null;
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

    billingDetails: BillingDetails[];
    setBillingDetails: () => void;

    resetBillingState: () => void;
}
