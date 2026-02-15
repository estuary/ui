// ── RHFPrefixAutocomplete (react-hook-form wrapper) ─────────────────

import { useMemo, useRef } from 'react';

import { PrefixAutocomplete } from './PrefixAutocomplete';
import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

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
    onChangeValidate = {},
    onBlurValidate = {},
}: RHFPrefixAutocompleteProps<TFieldValues, TName>) {
    const { control, trigger } = useFormContext<TFieldValues>();
    const hasBlurredRef = useRef(false);

    const allValidators = useMemo(() => {
        const gatedBlurValidators = Object.fromEntries(
            Object.entries(onBlurValidate).map(([key, fn]) => [
                key,
                (v: string) => (hasBlurredRef.current ? fn(v) : true),
            ])
        );

        return {
            ...onChangeValidate,
            ...gatedBlurValidators,
        };
    }, [onChangeValidate, onBlurValidate]);

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
                    leaves={leaves}
                    value={field.value ?? ''}
                    onChange={(event) => {
                        hasBlurredRef.current = false;
                        field.onChange(event);
                    }}
                    onBlur={() => {
                        hasBlurredRef.current = true;
                        field.onBlur();
                        trigger(name);
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
