import type { ToggleButtonProps, TooltipProps } from '@mui/material';
import type {
    FieldSelectionType,
    TranslatedConstraint,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldExistence } from 'src/types';

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface FieldListProps {
    field: string;
    pointer: string | undefined;
    editable?: boolean;
}

export interface FieldNameProps {
    existence: FieldExistence;
    field: string | undefined;
    pointer: string | undefined;
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
