import type { FieldValues, Path } from 'react-hook-form';
import type { RHFProgressiveValidationFieldProps } from 'src/components/shared/RHFFields/types';

import { Controller, useFormContext } from 'react-hook-form';

import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete';
import { useProgressiveValidation } from 'src/components/shared/RHFFields/useProgressiveValidation';

interface RHFLeavesAutocompleteProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> extends RHFProgressiveValidationFieldProps<TFieldValues, TName> {
    leaves: string[];
    helperText?: string;
}

export function RHFLeavesAutocomplete<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
    name,
    leaves,
    label,
    required = false,
    helperText,
    partialRules,
    finalRules,
}: RHFLeavesAutocompleteProps<TFieldValues, TName>) {
    const { control } = useFormContext<TFieldValues>();
    const { rules, restoreFinal, suppressFinal } = useProgressiveValidation(
        name,
        { partialRules, finalRules }
    );

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <LeavesAutocomplete
                    leaves={leaves}
                    value={field.value ?? ''}
                    onChange={(value) => {
                        field.onChange(value);
                        suppressFinal();
                    }}
                    onBlur={() => {
                        field.onBlur();
                        restoreFinal();
                    }}
                    label={label}
                    required={required}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    helperText={helperText}
                />
            )}
        />
    );
}
