import type { DataPlaneNode } from 'src/api/gql/dataPlanes';

export interface DataPlaneDialogProps {
    onClose: () => void;
    dataPlane: DataPlaneNode;
}

export interface RowsProps {
    data: DataPlaneNode[];
}

export interface RowProps {
    row: DataPlaneNode;
    rowSx: any;
    onRowClick: (row: DataPlaneNode) => void;
}

export interface DataPlaneDialogFieldProps {
    label: string;
    value: string | null;
    showCopyButton?: boolean;
}

interface ToggleOption {
    key: string;
    label: string;
    value: string | null;
}

export interface ToggleFieldProps {
    label: string;
    options: ToggleOption[];
    lowercaseButton?: boolean;
}
