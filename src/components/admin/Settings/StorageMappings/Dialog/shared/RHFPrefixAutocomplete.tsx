// ── RHFPrefixAutocomplete (react-hook-form wrapper) ─────────────────

import { useMemo, useRef } from 'react';

import {
    PrefixAutocomplete,
    useBasePrefixes,
    validatePrefix,
} from './PrefixAutocomplete';
import { Controller, FieldValues, useFormContext } from 'react-hook-form';
import { Path } from 'react-router';

type ValidateFn = (value: string) => true | string;
type ValidateRecord = Record<string, ValidateFn>;

interface RHFPrefixAutocompleteProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
    name: TName;
    leaves: string[];
    label: string;
    required?: boolean;
    helperText?: string;
    onChangeValidate?: ValidateRecord;
    onBlurValidate?: ValidateRecord;
}

export function RHFPrefixAutocomplete<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
    name,
    leaves,
    label,
    required = false,
    helperText,
    onChangeValidate,
    onBlurValidate,
}: RHFPrefixAutocompleteProps<TFieldValues, TName>) {
    const { control } = useFormContext<TFieldValues>();
    const basePrefixes = useBasePrefixes();
    const hasBlurredRef = useRef(false);

    const validate = useMemo(
        () => validatePrefix(basePrefixes),
        [basePrefixes]
    );

    const allValidators = useMemo(() => {
        const blurValidators: ValidateRecord = {
            ...onBlurValidate,
            validBasePrefix: (v: string) => validate(v) ?? true,
        };

        const gatedBlurValidators = Object.fromEntries(
            Object.entries(blurValidators).map(([key, fn]) => [
                key,
                (v: string) => (hasBlurredRef.current ? fn(v) : true),
            ])
        );

        return {
            startsWithRoot: (v: string) =>
                validatePrefixWhileTyping(v, basePrefixes) ?? true,
            ...onChangeValidate,
            ...gatedBlurValidators,
        };
    }, [basePrefixes, validate, onChangeValidate, onBlurValidate]);

    return (
        <Controller
            name={name}
            control={control}
            rules={{
                required: required ? `${label} is required` : false,
                validate: allValidators,
            }}
            render={({ field, fieldState }) => (
                <PrefixAutocomplete
                    roots={basePrefixes}
                    leaves={leaves}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={() => {
                        hasBlurredRef.current = true;
                        field.onBlur();
                    }}
                    label={label}
                    required={required}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    helperText={helperText}
                />
            )}
        />
    );
}
