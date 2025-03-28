import { ReactNode } from 'react';

import { AutocompleteRenderInputParams, Box, Input } from '@mui/material';

interface Props {
    textFieldProps: AutocompleteRenderInputParams;
    startAdornment: ReactNode | null;
}

function AutoCompleteInputWithStartAdornment({
    startAdornment: icon,
    textFieldProps,
}: Props) {
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
