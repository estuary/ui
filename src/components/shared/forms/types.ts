import type { ReactNode } from 'react';
import type { FieldValues, Path } from 'react-hook-form';

/** Generic option type for select components */
export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

/** Base props shared by RHF form components */
export interface RHFBaseProps<TFieldValues extends FieldValues> {
    /** Field name matching a path in the form schema */
    name: Path<TFieldValues>;
    /** Input label */
    label: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Helper text shown below the input */
    helperText?: ReactNode;
}
