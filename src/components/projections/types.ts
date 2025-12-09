import type { PostgrestError } from '@supabase/postgrest-js';
import type { Dispatch, SetStateAction } from 'react';
import type { ProjectionMetadata } from 'src/stores/Workflow/slices/Projections';
import type { BaseButtonProps } from 'src/types';
import type {
    RedactionStrategy_Projection,
    RedactionStrategy_Schema,
} from 'src/types/schemaModels';
import type { WithRequiredProperty } from 'src/types/utils';

export interface BaseProjectionProps {
    field: string;
    pointer?: string;
}

export interface BaseRedactFieldProps
    extends BaseButtonProps,
        WithRequiredProperty<BaseProjectionProps, 'pointer'> {
    strategy: RedactionStrategy_Projection | undefined;
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

export interface RedactSaveButtonProps
    extends WithRequiredProperty<BaseProjectionProps, 'pointer'> {
    closeDialog: () => void;
    previousStrategy: RedactionStrategy_Schema | null;
    setError: Dispatch<SetStateAction<PostgrestError | null>>;
    strategy: RedactionStrategy_Schema | null;
}
