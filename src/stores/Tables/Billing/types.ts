import { SelectableTableStore } from 'stores/Tables/Store';
import { ProjectedCostStats } from 'types';

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

export interface BillingDetailsDictionary {
    [date: string]: BillingDetails;
}

export interface BillingState extends SelectableTableStore {
    projectedCostStats: ProjectedCostStatsDictionary;
    setProjectedCostStats: (value: ProjectedCostStats[]) => void;

    billingDetails: BillingDetailsDictionary;
    setBillingDetails: () => void;
}
