import type { ChipProps, ToggleButtonProps, TooltipProps } from '@mui/material';
import type {
    FieldSelectionType,
    TranslatedConstraint,
} from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldOutcome } from 'src/types/wasm';

export interface ChipStatusProps {
    messageId: string;
    color: ChipProps['color'];
}

export interface ConstraintDetailsProps {
    constraint: TranslatedConstraint;
}

export interface FieldActionButtonProps extends ToggleButtonProps {
    bindingUUID: string;
    field: string;
    labelId: string;
    outcome: FieldOutcome;
    selection: FieldSelection | null;
    tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

export interface FieldActionsProps {
    bindingUUID: string;
    field: string;
    outcome: FieldOutcome;
    selectionType: FieldSelectionType | null;
}

export interface FieldListProps {
    field: string;
    pointer: string | undefined;
    editable?: boolean;
    sticky?: boolean;
}

export interface FieldNameProps {
    field: string;
    outcome: FieldOutcome;
}

export interface FieldOutcomeProps {
    outcome: FieldOutcome;
    selectionType: FieldSelectionType | null;
}

export interface ProjectionActionsProps {
    field: string;
    pointer: string | undefined;
}
