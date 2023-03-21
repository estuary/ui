import { SelectableTableStore } from 'stores/Tables/Store';
import { ProjectedCostStats } from 'types';

export interface ProjectedCostStatsDictionary {
    [date: string]: ProjectedCostStats[];
}

export interface BillingState extends SelectableTableStore {
    projectedCostStats: ProjectedCostStatsDictionary;
    setProjectedCostStats: (value: ProjectedCostStats[]) => void;
}
