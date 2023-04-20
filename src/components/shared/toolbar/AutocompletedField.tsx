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
    label: string;
    options: string[];
    defaultValue: string;
    changeHandler: (
        event: React.SyntheticEvent<Element, Event>,
        value: string,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<string> | undefined
    ) => void;
    id?: string;
    autocompleteSx?: SxProps<Theme>;
}

function AutocompletedField({
    label,
    options,
    defaultValue,
    changeHandler,
    id,
    autocompleteSx,
}: Props) {
    return (
        <Autocomplete
            id={id}
            options={options}
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
                    variant="outlined"
                    size="small"
                />
            )}
            defaultValue={defaultValue}
            disableClearable
            sx={autocompleteSx}
            onChange={changeHandler}
        />
    );
}

export default AutocompletedField;
