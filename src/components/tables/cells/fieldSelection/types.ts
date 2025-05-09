import type { ToggleButtonProps, TooltipProps } from '@mui/material';
import type { CSSProperties } from 'react';
import type {
    FieldSelectionType,
    TranslatedConstraint,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface EditableFieldProps {
    field: string;
    pointer: string | undefined;
    buttonStyles?: CSSProperties;
    readOnly?: boolean;
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
