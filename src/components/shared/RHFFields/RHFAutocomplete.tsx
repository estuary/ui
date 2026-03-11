import type { FieldValues, Path, RegisterOptions } from 'react-hook-form';
import type {
    RHFFieldProps,
    SelectOption,
} from 'src/components/shared/RHFFields/types';

import { Autocomplete, TextField } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';

interface RHFAutocompleteProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends RHFFieldProps<TFieldValues, TName> {
    options: SelectOption[];
    rules?: Omit<
        RegisterOptions<TFieldValues, TName>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    onUserSelect?: (value: string) => void;
}

/**
 * A controlled Autocomplete component integrated with react-hook-form.
 * Uses MUI Autocomplete with Controller for form state management.
 */
export function RHFAutocomplete<
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
}: RHFAutocompleteProps<TFieldValues, TName>) {
    const { control } = useFormContext<TFieldValues>();

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState: { error } }) => (
                <Autocomplete
                    fullWidth
                    size="small"
                    disabled={disabled}
                    options={options}
                    getOptionLabel={(option) =>
                        typeof option === 'string'
                            ? (options.find((o) => o.value === option)
                                  ?.label ?? option)
                            : option.label
                    }
                    value={
                        options.find((o) => o.value === field.value) ?? null
                    }
                    onChange={(_event, newValue) => {
                        const val = newValue?.value ?? '';
                        field.onChange(val);
                        onUserSelect?.(val);
                    }}
                    onBlur={field.onBlur}
                    isOptionEqualToValue={(option, val) =>
                        option.value === val.value
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            required={required}
                            error={!!error}
                            helperText={error?.message ?? helperText}
                            inputRef={field.ref}
                        />
                    )}
                />
            )}
        />
    );
}
