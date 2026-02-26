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

/** Base props shared by all RHF form components */
export interface RHFFieldProps<
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
}
/**
 * Splits validation into change-time and blur-time phases.
 * Blur validators are gated so they only run after the field
 * has been blurred, then suppressed again on field change.
 *
 * Triggers validation internally after the rules have updated,
 * so consumers don't need to call `trigger` themselves.
 */
export interface ValidationRules<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    /** Rules applied immediately on change. Must be a stable/memoized reference. */
    partialRules?: PartialRules<TFieldValues, TName>;
    /** Rules applied after the field has been blurred. Must be a stable/memoized reference. */
    finalRules?: FinalRules<TFieldValues, TName>;
}

/** Props for fields that support progressive validation (partial on change, final on blur) */
export interface RHFProgressiveValidationFieldProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends RHFFieldProps<TFieldValues, TName>,
        ValidationRules<TFieldValues, TName> {}

type BaseRules<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type PartialRules<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<BaseRules<TFieldValues, TName>, 'maxLength' | 'pattern' | 'validate'>;

export type FinalRules<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<
    BaseRules<TFieldValues, TName>,
    'required' | 'minLength' | 'pattern' | 'validate'
>;
