import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

export interface FieldEditorProps {
    input: string;
    inputInvalid: boolean;
    setInput: Dispatch<SetStateAction<string>>;
    setInputInvalid: Dispatch<SetStateAction<boolean>>;
    value: string;
    disabled?: boolean;
}

interface BaseEditProjectionProps {
    field: string;
    pointer: string | undefined;
}

export interface EditProjectionButtonProps extends BaseEditProjectionProps {
    disabled?: boolean;
}

export interface EditProjectionDialogProps extends BaseEditProjectionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ProjectionListProps {
    collection: string | undefined;
    projectedFields: ProjectionMetadata[];
    cannotExist?: boolean;
    editable?: boolean;
    maxChips?: number;
}
