import type { AutocompleteRenderInputParams } from '@mui/material';
import type { PrefixSelectorProps } from 'src/components/inputs/PrefixedName/types';

import { Autocomplete, TextField } from '@mui/material';

import { autoCompleteDefaults_Virtual_Non_Clearable } from 'src/components/shared/AutoComplete/DefaultProps';

// This is not TenantSelector because we need extra customization
//  eventually we should look into merging these. Initially this was
//  a standard `select` component - so it being `AutoComplete` at least
//  makes it closer to TenantSelector
function PrefixSelector({
    disabled,
    error,
    label,
    labelId,
    onChange,
    options,
    value,
    variantString,
}: PrefixSelectorProps) {
    return (
        <Autocomplete
            {...autoCompleteDefaults_Virtual_Non_Clearable}
            disabled={disabled}
            defaultValue={null}
            id={labelId}
            onChange={(_event, newValue) => onChange(newValue)}
            options={options}
            componentsProps={{
                paper: {
                    sx: {
                        minWidth: 'fit-content',
                    },
                },
            }}
            value={value}
            renderInput={({
                InputProps,
                ...params
            }: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    InputProps={{
                        ...InputProps,
                        disableUnderline: variantString === 'standard',
                        sx: { borderRadius: 3 },
                    }}
                    label={label}
                    error={Boolean(error)}
                    required
                    size="small"
                    sx={{
                        minWidth: 100,
                    }}
                    variant={variantString}
                />
            )}
        />
    );
}

export default PrefixSelector;
