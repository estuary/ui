import type { FieldValues, Path, PathValue } from 'react-hook-form';
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
    valueTransform,
    onChangeTransform,
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
            render={({ field, fieldState: { error } }) => {
                const displayValue = valueTransform
                    ? valueTransform(field.value)
                    : (field.value ?? '');

                const handleChange = (value: string) => {
                    const newValue = onChangeTransform
                        ? onChangeTransform(value)
                        : value;
                    field.onChange(newValue);
                    onUserSelect?.(value);
                };

                return (
                    <FormControl
                        fullWidth
                        size="small"
                        required={required}
                        disabled={disabled}
                        error={!!error}
                    >
                        <InputLabel>{label}</InputLabel>
                        <Select
                            value={displayValue}
                            onChange={(e) => {
                                focusValidation();
                                handleChange(e.target.value);
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
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
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
                );
            }}
        />
    );
}
