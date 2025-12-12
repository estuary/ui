import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

export interface DataPlaneDialogProps {
    onClose: () => void;
    dataPlane: BaseDataPlaneQuery;
}

export interface RowsProps {
    data: BaseDataPlaneQuery[];
}

export interface RowProps {
    row: BaseDataPlaneQuery;
    rowSx: any;
    onRowClick: (row: BaseDataPlaneQuery) => void;
}

export interface DataPlaneDialogFieldProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
}

export interface ToggleOption {
    key: string;
    label: string;
    value: string | null;
}

export interface ToggleFieldProps {
    label: string;
    options: ToggleOption[];
    lowercaseButton?: boolean;
}
