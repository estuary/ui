import { PublicationInfo } from 'deps/control-plane/types';
import { SortDirection } from 'types';

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
