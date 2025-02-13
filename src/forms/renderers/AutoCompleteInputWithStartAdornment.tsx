import { AutocompleteRenderInputParams, Box, Input } from '@mui/material';

interface Props {
    textFieldProps: AutocompleteRenderInputParams;
    icon: any | undefined;
}

function AutoCompleteInputWithStartAdornment({ icon, textFieldProps }: Props) {
    textFieldProps.InputProps.startAdornment = icon;
    if (icon) {
        textFieldProps.InputProps.startAdornment = (
            <Box style={{ paddingRight: 10 }}>{icon}</Box>
        );
    }

    return (
        <Input
            {...textFieldProps.InputProps}
            inputProps={textFieldProps.inputProps}
            fullWidth={textFieldProps.fullWidth}
            disabled={textFieldProps.disabled}
        />
    );
}

export default AutoCompleteInputWithStartAdornment;
