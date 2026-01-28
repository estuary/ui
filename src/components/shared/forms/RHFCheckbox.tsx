import type { ReactNode } from 'react';
import type { FieldValues, Path, RegisterOptions } from 'react-hook-form';

import { Checkbox, FormControlLabel } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

interface RHFCheckboxProps<TFieldValues extends FieldValues> {
    /** Field name matching a path in the form schema */
    name: Path<TFieldValues>;
    /** Checkbox label */
    label: ReactNode;
    /** Whether the checkbox is disabled */
    disabled?: boolean;
    /** Validation rules */
    rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
}

/**
 * A controlled Checkbox component integrated with react-hook-form.
 * Uses MUI Checkbox with Controller for form state management.
 */
export function RHFCheckbox<TFieldValues extends FieldValues>({
    name,
    label,
    disabled = false,
    rules,
}: RHFCheckboxProps<TFieldValues>) {
    const { control } = useFormContext<TFieldValues>();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={field.value ?? false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={disabled}
                            size="small"
                        />
                    }
                    label={label}
                    slotProps={{
                        typography: {
                            variant: 'body2',
                        },
                    }}
                />
            )}
        />
    );
}
