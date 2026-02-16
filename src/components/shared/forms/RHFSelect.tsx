import type { ReactNode } from 'react';
import type {
    FieldValues,
    Path,
    PathValue,
    RegisterOptions,
} from 'react-hook-form';
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

interface RHFSelectProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends Omit<RHFBaseProps<TFieldValues>, 'name'> {
    name: TName;
    /** Available options for the select */
    options: SelectOption[];
    /** Validation rules */
    rules?: RegisterOptions<TFieldValues, TName>;
    /** Placeholder shown when no value is selected */
    placeholder?: ReactNode;
    /**
     * Transform the form value before displaying in the Select.
     * Useful when form stores arrays but Select expects single value.
     */
    valueTransform?: (value: PathValue<TFieldValues, TName>) => string;
    /**
     * Transform the selected value before calling onChange.
     * Useful when form stores arrays but Select provides single value.
     */
    onChangeTransform?: (value: string) => PathValue<TFieldValues, TName>;
    /** Called when the user selects a value (not on programmatic changes) */
    onUserSelect?: () => void;
}

/**
 * A controlled Select component integrated with react-hook-form.
 * Uses MUI Select with Controller for form state management.
 */
export function RHFSelect<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
    name,
    label,
    options,
    required = false,
    disabled = false,
    helperText,
    rules,
    placeholder,
    valueTransform,
    onChangeTransform,
    onUserSelect,
}: RHFSelectProps<TFieldValues, TName>) {
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
            render={({ field }) => {
                const displayValue = valueTransform
                    ? valueTransform(field.value)
                    : (field.value ?? '');

                const handleChange = (value: string) => {
                    const newValue = onChangeTransform
                        ? onChangeTransform(value)
                        : value;
                    field.onChange(newValue);
                    onUserSelect?.();
                };

                return (
                    <FormControl
                        fullWidth
                        size="small"
                        required={required}
                        disabled={disabled}
                        error={hasError}
                    >
                        <InputLabel>{label}</InputLabel>
                        <Select
                            value={displayValue}
                            onChange={(e) => handleChange(e.target.value)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            label={label}
                            displayEmpty={!!placeholder}
                        >
                            {placeholder ? (
                                <MenuItem value="" disabled>
                                    {placeholder}
                                </MenuItem>
                            ) : null}
                            {options.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
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
                );
            }}
        />
    );
}
