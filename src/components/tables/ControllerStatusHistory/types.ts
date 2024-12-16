import { SortDirection } from 'types';
import { PublicationInfo } from 'utils/entityStatus-utils';

export interface RowProps {
    row: PublicationInfo;
}

export interface RowsProps {
    columnToSort: string;
    data: PublicationInfo[];
    sortDirection: SortDirection;
}

export interface TableProps {
    history: PublicationInfo[] | null | undefined;
    serverErrorExists: boolean;
}
