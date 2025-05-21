import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

export interface FieldEditorProps {
    labelMessageId: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
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
    diminishedText?: boolean;
    editable?: boolean;
    maxChips?: number;
}
