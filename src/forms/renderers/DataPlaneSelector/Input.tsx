import Box from '@mui/material/Box';
import Input from '@mui/material/Input';

interface Props {
    appliedUiSchemaOptions: any;
    currentOption: any | null;
    enabled: any;
    inputProps: any;
    InputProps: any;
}

export default function DataPlaneInput({
    appliedUiSchemaOptions,
    currentOption,
    enabled,
    inputProps,
    InputProps,
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
