import type { AutocompleteRenderInputParams } from '@mui/material';
import { Box, Input } from '@mui/material';
import type { ReactNode } from 'react';

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
