import type { FieldEditorProps } from 'src/components/projections/types';

import {
    FormHelperText,
    FormLabel,
    inputBaseClasses,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { ArrowRight } from 'iconoir-react';

function FieldEditor({
    disabled,
    input,
    inputInvalid,
    setInput,
    setInputInvalid,
    value,
}: FieldEditorProps) {
    const theme = useTheme();

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                alignItems: 'center',
                flexGrow: 1,
            }}
        >
            <Stack style={{ flex: '1 1 0px' }}>
                <FormLabel
                    style={{
                        color: theme.palette.text.diminished,
                        fontSize: 10,
                    }}
                >
                    Current Name
                </FormLabel>

                <Typography
                    style={{
                        borderBottom: `1px dashed ${theme.palette.text.diminished}`,
                        color: theme.palette.text.diminished,
                        paddingBottom: 4,
                        paddingTop: 3,
                    }}
                >
                    {value}
                </Typography>
            </Stack>

            <ArrowRight
                style={{
                    fontSize: 12,
                    color: theme.palette.text.primary,
                }}
            />

            <Stack style={{ flex: '1 1 0px' }}>
                <TextField
                    autoFocus
                    disabled={disabled}
                    error={inputInvalid}
                    label="New Name"
                    onChange={(event) => {
                        setInput(event.target.value);
                        setInputInvalid(
                            event.target.value.trim().startsWith('/')
                        );
                    }}
                    size="small"
                    sx={{
                        flex: '1 1 0px',
                        [`& .${inputBaseClasses.root}`]: {
                            borderRadius: 3,
                        },
                    }}
                    value={input}
                />

                {inputInvalid ? (
                    <FormHelperText error={inputInvalid}>
                        Field names cannot begin with a forward slash (/).
                    </FormHelperText>
                ) : null}
            </Stack>
        </Stack>
    );
}

export default FieldEditor;
