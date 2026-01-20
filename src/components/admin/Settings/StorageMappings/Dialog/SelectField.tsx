import type {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
} from 'react-hook-form';

import { FormControl, FormLabel, NativeSelect } from '@mui/material';

interface Option {
    value: string;
    label: string;
}

interface SelectFieldProps<T extends FieldValues> {
    name: Path<T>;
    register: UseFormRegister<T>;
    label: string;
    options: Option[];
    disabled?: boolean;
    error?: boolean;
    required?: boolean;
    rules?: RegisterOptions<T, Path<T>>;
}

export function SelectField<T extends FieldValues>({
    name,
    register,
    label,
    options,
    disabled = false,
    error = false,
    required = false,
    rules,
}: SelectFieldProps<T>) {
    return (
        <FormControl
            fullWidth
            size="small"
            error={error}
            disabled={disabled}
            required={required}
        >
            <NativeSelect
                {...register(name, rules)}
                sx={{
                    // px: 1,
                    py: 0.5,
                }}
            >
                <option value="">{''}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </NativeSelect>
            <FormLabel>{label}</FormLabel>
        </FormControl>
    );
}
