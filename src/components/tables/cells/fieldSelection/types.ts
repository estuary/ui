import type { ToggleButtonProps, TooltipProps } from '@mui/material';
import type {
    FieldSelectionType,
    Projection,
    TranslatedConstraint,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface EditableFieldProps {
    projection: Projection;
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
