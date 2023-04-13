import { SelectableTableStore } from 'stores/Tables/Store';
import { Entity, ProjectedCostStats } from 'types';

export interface ProjectedCostStatsDictionary {
    [date: string]: ProjectedCostStats[];
}

export interface BillingDetails {
    date: Date;
    month: number;
    year: number;
    dataVolume: number;
    taskCount: number;
    details: string | null;
    totalCost: number;
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
