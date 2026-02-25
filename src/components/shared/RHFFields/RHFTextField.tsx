import type { FieldValues, Path, PathValue } from 'react-hook-form';
import type { RHFProgressiveValidationFieldProps } from 'src/components/shared/RHFFields/types';

import { TextField } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

import { useProgressiveValidation } from 'src/components/shared/RHFFields/useProgressiveValidation';

interface RHFTextFieldProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends RHFProgressiveValidationFieldProps<TFieldValues, TName> {}

export function RHFTextField<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
    name,
    label,
    required = false,
    disabled = false,
    helperText,
    partialRules,
    finalRules,
}: RHFTextFieldProps<TFieldValues, TName>) {
    const { control } = useFormContext<TFieldValues>();
    const { rules, onBlur, onChange } = useProgressiveValidation(name, {
        partialRules,
        finalRules,
    });

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    value={field.value ?? ''}
                    onChange={(e) => {
                        onChange(
                            e.target.value as PathValue<TFieldValues, TName>
                        );
                    }}
                    onBlur={() => {
                        field.onBlur();
                        onBlur();
                    }}
                    name={field.name}
                    inputRef={field.ref}
                    label={label}
                    required={required}
                    disabled={disabled}
                    fullWidth
                    size="small"
                    error={!!error}
                    helperText={error?.message ?? helperText}
                />
            )}
        />
    );
}
