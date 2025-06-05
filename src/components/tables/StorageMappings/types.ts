import type { StorageMappings, StorageMappingStore } from 'src/types';

export interface RowProps {
    row: StorageMappings;
}

export interface RowsProps {
    data: StorageMappings[];
}

export interface DataPlaneCellsProps {
    dataPlanes: string[];
    store: StorageMappingStore;
}
