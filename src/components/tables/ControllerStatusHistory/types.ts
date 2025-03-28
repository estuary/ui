import { SortDirection } from 'src/types';
import { PublicationInfo } from 'src/types/controlPlane';

export interface RowProps {
    row: PublicationInfo;
}

export interface RowsProps {
    columnToSort: string;
    data: PublicationInfo[];
    sortDirection: SortDirection;
}
