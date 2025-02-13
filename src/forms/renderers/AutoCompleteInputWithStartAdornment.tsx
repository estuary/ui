import { AutocompleteRenderInputParams, Box, Input } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
    textFieldProps: AutocompleteRenderInputParams;
    icon: ReactNode | undefined;
}

function AutoCompleteInputWithStartAdornment({ icon, textFieldProps }: Props) {
    textFieldProps.InputProps.startAdornment = icon;
    if (icon) {
        textFieldProps.InputProps.startAdornment = (
            <Box style={{ paddingRight: 5 }}>{icon}</Box>
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
