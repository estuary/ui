import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import ConnectorIcon from 'components/connectors/ConnectorIcon';

interface Props {
    InputProps: any;
    appliedUiSchemaOptions: any;
    currentOption: any | null;
    enabled: any;
    inputProps: any;
}

function ConnectorInput({
    inputProps,
    InputProps,
    currentOption,
    appliedUiSchemaOptions,
    enabled,
}: Props) {
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
                    <ConnectorIcon iconPath={currentOption.value.iconPath} />
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

export default ConnectorInput;
