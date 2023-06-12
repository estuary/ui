import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteRenderInputParams,
    SxProps,
    TextField,
    Theme,
} from '@mui/material';

interface Props {
    defaultValue: string;
    label: string;
    options: string[];
    changeHandler: (
        event: React.SyntheticEvent<Element, Event>,
        value: string,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<string> | undefined
    ) => void;
    autocompleteSx?: SxProps<Theme>;
    id?: string;
    required?: boolean;
}

function AutocompletedField({
    autocompleteSx,
    changeHandler,
    defaultValue,
    id,
    label,
    options,
    required,
}: Props) {
    return (
        <Autocomplete
            defaultValue={defaultValue}
            disableClearable
            id={id}
            onChange={changeHandler}
            options={options}
            sx={autocompleteSx}
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
