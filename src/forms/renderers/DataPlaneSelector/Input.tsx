import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import DataPlaneIcon from './DataPlaneIcon';

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
            {currentOption ? (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 22,
                    }}
                >
                    <DataPlaneIcon
                        iconPath={currentOption.value.iconPath}
                        scope={currentOption.value.scope}
                    />
                </Box>
            ) : null}

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
