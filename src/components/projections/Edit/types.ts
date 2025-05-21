import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';

export interface FieldEditorProps {
    labelMessageId: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    value: string;
    disabled?: boolean;
}

export interface BaseEditProjectionProps {
    field: string;
    pointer: string | undefined;
}

export interface EditProjectionDialogProps extends BaseEditProjectionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ProjectionListProps {
    collection: string | undefined;
    projectedFields: ProjectionMetadata[];
    deletable?: boolean;
    diminishedText?: boolean;
    maxChips?: number;
}
