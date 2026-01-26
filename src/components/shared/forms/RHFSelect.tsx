import type { ReactNode } from 'react';
import type { FieldValues, Path, RegisterOptions } from 'react-hook-form';
import type {
    RHFBaseProps,
    SelectOption,
} from 'src/components/shared/forms/types';

import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

interface RHFSelectProps<TFieldValues extends FieldValues>
    extends RHFBaseProps<TFieldValues> {
    /** Available options for the select */
    options: SelectOption[];
    /** Validation rules */
    rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
    /** Placeholder shown when no value is selected */
    placeholder?: ReactNode;
}

/**
 * A controlled Select component integrated with react-hook-form.
 * Uses MUI Select with Controller for form state management.
 */
export function RHFSelect<TFieldValues extends FieldValues>({
    name,
    label,
    options,
    required = false,
    disabled = false,
    helperText,
    rules,
    placeholder,
}: RHFSelectProps<TFieldValues>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<TFieldValues>();

    // Get nested error by path
    const error = name.split('.').reduce<unknown>((obj, key) => {
        if (obj && typeof obj === 'object' && key in obj) {
            return (obj as Record<string, unknown>)[key];
        }
        return undefined;
    }, errors) as { message?: string } | undefined;

    const hasError = !!error;
    const errorMessage = error?.message;

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <FormControl
                    fullWidth
                    size="small"
                    required={required}
                    disabled={disabled}
                    error={hasError}
                >
                    <InputLabel>{label}</InputLabel>
                    <Select
                        {...field}
                        label={label}
                        displayEmpty={!!placeholder}
                    >
                        {placeholder ? (
                            <MenuItem value="" disabled>
                                {placeholder}
                            </MenuItem>
                        ) : null}
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError || helperText ? (
                        <FormHelperText>
                            {errorMessage ?? helperText}
                        </FormHelperText>
                    ) : null}
                </FormControl>
            )}
        />
    );
}
