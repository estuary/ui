import { ToggleButtonProps, TooltipProps } from '@mui/material';
import {
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import { FieldSelection } from 'stores/Binding/slices/FieldSelection';

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface FieldActionButtonProps extends ToggleButtonProps {
    bindingUUID: string;
    constraint: TranslatedConstraint;
    field: string;
    labelId: string;
    selection: FieldSelection | null;
    tooltipPlacement?: TooltipProps['placement'];
}

export interface FieldActionsProps {
    bindingUUID: string;
    field: string;
    constraint: TranslatedConstraint;
    selectionType: FieldSelectionType | null;
}
