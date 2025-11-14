import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';
import type { RedactionStrategy } from 'src/types/schemaModels';

export interface BaseButtonProps {
    disabled?: boolean;
}

export interface BaseDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface BaseProjectionProps {
    field: string;
    pointer?: string;
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

export interface RedactSaveButtonProps extends BaseProjectionProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    strategy: RedactionStrategy | null;
}
