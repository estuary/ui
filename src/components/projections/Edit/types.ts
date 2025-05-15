import type { Dispatch, SetStateAction } from 'react';
import type { CSSTextProperties } from 'src/components/tables/cells/types';
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
    fieldTextStyles?: CSSTextProperties;
}

export interface EditProjectionDialogProps extends BaseEditProjectionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface ProjectionDefinitionsProps {
    collection: string | undefined;
    projectedFields: ProjectionMetadata[];
}
