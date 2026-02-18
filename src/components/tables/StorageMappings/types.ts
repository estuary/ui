import type { SxProps, Theme } from '@mui/material';
import type { StorageMappingsQuery, StorageMappingStore } from 'src/types';

export interface RowProps {
    row: StorageMappingsQuery;
    rowSx: SxProps<Theme>;
    onRowClick: (row: StorageMappingsQuery) => void;
}

export interface RowsProps {
    data: StorageMappingsQuery[];
}

export interface DataPlaneCellsProps {
    dataPlanes: string[];
    store: StorageMappingStore;
}
