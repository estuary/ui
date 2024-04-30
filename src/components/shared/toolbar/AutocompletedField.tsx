import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    SxProps,
    TextField,
    Theme,
} from '@mui/material';

interface Props {
    label: string;
    options: string[];
    changeHandler: (
        event: React.SyntheticEvent<Element, Event>,
        value: string,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<string> | undefined
    ) => void;
    autocompleteSx?: SxProps<Theme>;
    defaultValue?: string;
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
            defaultValue={defaultValue}
            disableClearable
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
