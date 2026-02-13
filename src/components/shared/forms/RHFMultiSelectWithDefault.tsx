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

import { Autocomplete, Box, Chip, Stack, TextField } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

interface RHFMultiSelectWithDefaultProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends Omit<RHFBaseProps<TFieldValues>, 'name'> {
    name: TName;
    /** Available options for selection */
    options: SelectOption[];
    /** Validation rules */
    rules?: RegisterOptions<TFieldValues, TName>;
    /** Label for the first (default) selection */
    defaultLabel?: string;
    /** Label for additional selections */
    additionalLabel?: string;
    /**
     * Transform the form value before displaying in the Autocomplete.
     * Useful when form stores objects but Autocomplete expects string values.
     */
    valueTransform?: (value: PathValue<TFieldValues, TName>) => string[];
    /**
     * Transform the selected values before calling onChange.
     * Useful when form stores objects but Autocomplete provides string values.
     */
    onChangeTransform?: (values: string[]) => PathValue<TFieldValues, TName>;
}

/**
 * A multi-select Autocomplete that distinguishes between a "default" (first) selection
 * and "additional" selections with separate visual groupings.
 *
 * The order of selection is preserved - the first item selected becomes the "default".
 *
 * @example
 * // With transforms for object arrays
 * <RHFMultiSelectWithDefault<FormData>
 *     name="data_planes"
 *     valueTransform={(value) => value.map((dp) => dp.name)}
 *     onChangeTransform={(names) => names.map(nameToDataPlane)}
 * />
 */
export function RHFMultiSelectWithDefault<
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
    defaultLabel = 'Default:',
    additionalLabel = 'Additional:',
    valueTransform,
    onChangeTransform,
}: RHFMultiSelectWithDefaultProps<TFieldValues, TName>) {
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

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => {
                // Field value is an array of option values (strings)
                const selectedValues = valueTransform
                    ? valueTransform(
                          field.value as PathValue<TFieldValues, TName>
                      )
                    : ((field.value ?? []) as string[]);

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
                            const newValues = newValue.map((v) => v.value);
                            const transformedValue = onChangeTransform
                                ? onChangeTransform(newValues)
                                : newValues;
                            field.onChange(transformedValue);
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
