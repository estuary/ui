import { SortDirection } from 'types';
import { PublicationInfo } from 'types/controlPlane';

export interface RowProps {
    row: PublicationInfo;
}

export interface RowsProps {
    columnToSort: string;
    data: PublicationInfo[];
    sortDirection: SortDirection;
}
