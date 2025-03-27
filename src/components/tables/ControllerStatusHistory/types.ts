import type { SortDirection } from 'src/types';
import type { PublicationInfo } from 'src/types/controlPlane';

export interface RowProps {
    row: PublicationInfo;
}

export interface RowsProps {
    columnToSort: string;
    data: PublicationInfo[];
    sortDirection: SortDirection;
}
