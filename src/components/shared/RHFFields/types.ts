import type { ReactNode } from 'react';
import type {
    FieldPath,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';

/** Generic option type for select components */
export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}

/** Base props shared by RHF form components */
export interface RHFBaseProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
    /** Field name matching a path in the form schema */
    name: TName;
    /** Input label */
    label: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Helper text shown below the input */
    helperText?: ReactNode;
    /** Validation rules applied immediately on change */
    partialRules?: PartialRules<TFieldValues, TName>;
    /** Validation rules applied after the field has been blurred */
    finalRules?: FinalRules<TFieldValues, TName>;
}

type BaseRules<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type PartialRules<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Pick<BaseRules<TFieldValues, TName>, 'maxLength' | 'pattern' | 'validate'>;

export type FinalRules<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Pick<
    BaseRules<TFieldValues, TName>,
    'required' | 'minLength' | 'pattern' | 'validate'
>;
