import type {
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import type { SelectOption } from 'src/components/shared/RHFFields/types';

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
> {
    name: TName;
    label: string;
    options: SelectOption[];
    required?: boolean;
    disabled?: boolean;
    helperText?: React.ReactNode;
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
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
    rules,
    onUserSelect,
}: RHFSelectProps<TFieldValues, TName>) {
    const { control } = useFormContext<TFieldValues>();

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
                            field.onChange(e.target.value);
                            onUserSelect?.(e.target.value);
                        }}
                        onBlur={field.onBlur}
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
