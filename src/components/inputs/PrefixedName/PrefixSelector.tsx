import {
    Autocomplete,
    AutocompleteRenderInputParams,
    TextField,
} from '@mui/material';
import { autoCompleteDefaults_Virtual_Non_Clearable } from 'components/shared/AutoComplete/DefaultProps';
import { PrefixSelectorProps } from './types';

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
            value={value}
            componentsProps={{
                paper: {
                    sx: {
                        minWidth: 'fit-content',
                    },
                },
            }}
            renderInput={({
                InputProps,
                ...params
            }: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    InputProps={{
                        ...InputProps,
                        // This throws an error for _some_ reason and I do not know why
                        //  as it works and is needed so there isn't a "double underline"
                        //  when using this in the create/edit workflows
                        disableUnderline: variantString === 'standard',
                        sx: { borderRadius: 3 },
                    }}
                    label={label}
                    error={Boolean(error)}
                    required
                    size="small"
                    sx={{
                        maxWidth: 250,
                        minWidth: 100,
                    }}
                    variant={variantString}
                />
            )}
        />
    );
}

export default PrefixSelector;
