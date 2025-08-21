import type {
    ChipProps,
    TableCellProps,
    ToggleButtonProps,
    TooltipProps,
} from '@mui/material';
import type {
    FieldSelectionType,
    TranslatedConstraint,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

export interface ChipStatusProps {
    messageId: string;
    color: ChipProps['color'];
    TableCellProps?: Partial<TableCellProps>;
}

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface FieldListProps {
    field: string;
    pointer: string | undefined;
    editable?: boolean;
    sticky?: boolean;
}

export interface FieldActionButtonProps extends ToggleButtonProps {
    bindingUUID: string;
    constraint: TranslatedConstraint;
    field: string;
    labelId: string;
    selection: FieldSelection | null;
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

export interface FieldActionsProps {
    bindingUUID: string;
    field: string;
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType | null;
}

export interface ProjectionActionsProps {
    field: string;
    pointer: string | undefined;
}
