import type { FieldValues, Path } from 'react-hook-form';
import type {
    RHFBaseProps,
    SelectOption,
} from 'src/components/shared/RHFFields/types';

import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

import { useProgressiveValidation } from 'src/components/shared/RHFFields/useProgressiveValidation';

interface RHFSelectProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends RHFBaseProps<TFieldValues, TName> {
    /** Available options for the select */
    options: SelectOption[];
    /** Called when the user selects a value (not on programmatic changes) */
    onUserSelect?: (value: string) => void;
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
    partialRules = {},
    finalRules = {},
    onUserSelect,
}: RHFSelectProps<TFieldValues, TName>) {
    const { control, trigger } = useFormContext<TFieldValues>();
    const { rules, blurValidation, focusValidation } = useProgressiveValidation(
        {
            partialRules,
            finalRules,
        }
    );

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <FormControl
                    fullWidth
                    size="small"
                    required={required}
                    disabled={disabled}
                    error={!!error}
                >
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={field.value ?? ''}
                        onChange={(e) => {
                            focusValidation();
                            field.onChange(e.target.value);
                            onUserSelect?.(e.target.value);
                        }}
                        onBlur={() => {
                            field.onBlur();
                            blurValidation(() => trigger(name));
                        }}
                        name={field.name}
                        ref={field.ref}
                        label={label}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {error || helperText ? (
                        <FormHelperText>
                            {error?.message ?? helperText}
                        </FormHelperText>
                    ) : null}
                </FormControl>
            )}
        />
    );
}
