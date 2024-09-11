import Box from '@mui/material/Box';
import Input from '@mui/material/Input';

interface Props {
    inputProps: any;
    InputProps: any;
    currentOption: any | null;
    appliedUiSchemaOptions: any;
    enabled: any;
}

export default function DataPlaneInput({
    inputProps,
    InputProps,
    currentOption,
    appliedUiSchemaOptions,
    enabled,
}: Props) {
    console.log(currentOption);
    return (
        <Box
            sx={{
                '.MuiBox-root + .MuiInput-root > input': {
                    textIndent: '25px',
                },
            }}
        >
            <Input
                style={{ width: '100%' }}
                type="text"
                inputProps={inputProps}
                inputRef={InputProps.ref}
                autoFocus={appliedUiSchemaOptions.focus}
                disabled={!enabled}
            />
        </Box>
    );
}
