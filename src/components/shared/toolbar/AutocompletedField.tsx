import type {
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    SxProps,
    Theme,
} from '@mui/material';

import { Autocomplete, TextField } from '@mui/material';

import { autoCompleteDefaults_Virtual_Non_Clearable } from 'src/components/shared/AutoComplete/DefaultProps';

interface Props {
    label: string;
    options: any[];
    changeHandler: (
        event: React.SyntheticEvent<Element, Event>,
        value: any,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<string> | undefined
    ) => void;
    autocompleteSx?: SxProps<Theme>;
    defaultValue?: any;
    id?: string;
    required?: boolean;
    AutoCompleteOptions?: Partial<
        AutocompleteProps<any, false, true, false, 'div'>
    >;
}

function AutocompletedField({
    autocompleteSx,
    changeHandler,
    defaultValue,
    id,
    label,
    options,
    required,
    AutoCompleteOptions,
}: Props) {
    return (
        <Autocomplete
            {...autoCompleteDefaults_Virtual_Non_Clearable}
            defaultValue={defaultValue}
            id={id}
            onChange={changeHandler}
            options={options}
            sx={autocompleteSx}
            {...AutoCompleteOptions}
            renderInput={({
                InputProps,
                ...params
            }: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    InputProps={{
                        ...InputProps,
                        sx: { borderRadius: 3 },
                    }}
                    label={label}
                    required={required}
                    size="small"
                    variant="outlined"
                />
            )}
        />
    );
}

export default AutocompletedField;
