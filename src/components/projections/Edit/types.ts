import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

interface BaseProjectionProps {
    field: string;
    pointer: string | undefined;
}

export interface BaseProjectionButtonProps extends BaseProjectionProps {
    disabled?: boolean;
}

export interface BaseProjectionDialogProps extends BaseProjectionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface FieldEditorProps {
    input: string;
    inputInvalid: boolean;
    setInput: Dispatch<SetStateAction<string>>;
    setInputInvalid: Dispatch<SetStateAction<boolean>>;
    value: string;
    disabled?: boolean;
}

export interface ProjectionListProps {
    collection: string | undefined;
    projectedFields: ProjectionMetadata[];
    cannotExist?: boolean;
    editable?: boolean;
    maxChips?: number;
}
