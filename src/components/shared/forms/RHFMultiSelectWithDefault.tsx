import type { ReactNode } from 'react';
import type { RegisterOptions } from 'react-hook-form';
import type { SelectOption } from 'src/components/shared/forms/types';

import { Autocomplete, Box, Chip, Stack, TextField } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

interface RHFMultiSelectWithDefaultProps {
    /** Field name matching a path in the form schema */
    name: string;
    /** Input label */
    label: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Helper text shown below the input */
    helperText?: ReactNode;
    /** Available options for selection */
    options: SelectOption[];
    /** Validation rules */
    rules?: RegisterOptions;
    /** Label for the first (default) selection */
    defaultLabel?: string;
    /** Label for additional selections */
    additionalLabel?: string;
}

/**
 * A multi-select Autocomplete that distinguishes between a "default" (first) selection
 * and "additional" selections with separate visual groupings.
 *
 * The order of selection is preserved - the first item selected becomes the "default".
 */
export function RHFMultiSelectWithDefault({
    name,
    label,
    options,
    required = false,
    disabled = false,
    helperText,
    rules,
    defaultLabel = 'Default:',
    additionalLabel = 'Additional:',
}: RHFMultiSelectWithDefaultProps) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    // Get nested error by path
    const error = name.split('.').reduce<unknown>((obj, key) => {
        if (obj && typeof obj === 'object' && key in obj) {
            return (obj as Record<string, unknown>)[key];
        }
        return undefined;
    }, errors) as { message?: string } | undefined;

    const hasError = !!error;

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => {
                // Field value is an array of option values (strings)
                const selectedValues = (field.value ?? []) as string[];

                // Map selected values back to full options, preserving order
                const selectedOptions = selectedValues
                    .map((val) => options.find((opt) => opt.value === val))
                    .filter(Boolean) as SelectOption[];

                return (
                    <Autocomplete
                        multiple
                        disableClearable
                        disabled={disabled}
                        value={selectedOptions}
                        onChange={(_event, newValue) => {
                            field.onChange(newValue.map((v) => v.value));
                        }}
                        options={options}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                            option.value === value.value
                        }
                        renderTags={(value, getTagProps) => (
                            <Box sx={{ width: '100%' }}>
                                {value.length > 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: value.length > 1 ? 0.5 : 0,
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                typography: 'caption',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {defaultLabel}
                                        </Box>
                                        <Chip
                                            {...getTagProps({ index: 0 })}
                                            label={value[0].label}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                ) : null}
                                {value.length > 1 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                typography: 'caption',
                                                color: 'text.secondary',
                                                lineHeight: '24px',
                                            }}
                                        >
                                            {additionalLabel}
                                        </Box>
                                        <Stack spacing={0.5}>
                                            {value.slice(1).map((option, i) => (
                                                <Chip
                                                    {...getTagProps({
                                                        index: i + 1,
                                                    })}
                                                    key={option.value}
                                                    label={option.label}
                                                    size="small"
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                ) : null}
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                size="small"
                                required={required}
                                error={hasError}
                                helperText={error?.message ?? helperText}
                            />
                        )}
                        size="small"
                    />
                );
            }}
        />
    );
}
