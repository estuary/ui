import type { ChipProps, ToggleButtonProps, TooltipProps } from '@mui/material';
import type {
    FieldSelectionType,
    TranslatedConstraint,
} from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldOutcome, RejectOutput, SelectOutput } from 'src/types/wasm';

export interface BaseFieldOutcomeProps {
    outcome: FieldOutcome;
}

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

export interface FieldNameProps extends BaseFieldOutcomeProps {
    field: string;
}

export interface FieldOutputProps {
    output: SelectOutput | RejectOutput;
    indicateConflict?: boolean;
    outcome?: FieldOutcome;
}

export interface ProjectionActionsProps {
    field: string;
    pointer: string | undefined;
}
