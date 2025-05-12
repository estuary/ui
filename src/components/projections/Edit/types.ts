import type { Dispatch, SetStateAction } from 'react';
import type { CSSTextProperties } from 'src/components/tables/cells/types';

export interface FieldEditorProps {
    labelMessageId: string;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    value: string;
    disabled?: boolean;
}

export interface EditProjectionButtonProps {
    field: string;
    pointer: string | undefined;
    fieldTextStyles?: CSSTextProperties;
}

export interface EditProjectionDialogProps {
    field: string;
    open: boolean;
    pointer: string | undefined;
    setOpen: Dispatch<SetStateAction<boolean>>;
}
