import type { StorageMappingsQuery, StorageMappingStore } from 'src/types';

export interface RowProps {
    row: StorageMappingsQuery;
}

export interface RowsProps {
    data: StorageMappingsQuery[];
}

export interface DataPlaneCellsProps {
    dataPlanes: string[];
    store: StorageMappingStore;
}
