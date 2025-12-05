import type { FieldEditorProps } from 'src/components/projections/types';

import {
    FormHelperText,
    FormLabel,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';

function FieldEditor({
    disabled,
    input,
    inputInvalid,
    setInput,
    setInputInvalid,
    value,
}: FieldEditorProps) {
    const intl = useIntl();
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
                        color: diminishedTextColor[theme.palette.mode],
                        fontSize: 10,
                    }}
                >
                    {intl.formatMessage({
                        id: 'projection.label.fieldName.current',
                    })}
                </FormLabel>

                <Typography
                    style={{
                        borderBottom: `1px dashed ${diminishedTextColor[theme.palette.mode]}`,
                        color: diminishedTextColor[theme.palette.mode],
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
                    label={intl.formatMessage({
                        id: 'projection.label.fieldName.new',
                    })}
                    onChange={(event) => {
                        setInput(event.target.value);
                        setInputInvalid(
                            event.target.value.trim().startsWith('/')
                        );
                    }}
                    size="small"
                    sx={{
                        'flex': '1 1 0px',
                        '& .MuiInputBase-root': {
                            borderRadius: 3,
                        },
                    }}
                    value={input}
                />

                {inputInvalid ? (
                    <FormHelperText error={inputInvalid}>
                        {intl.formatMessage({
                            id: 'projection.error.input.invalidFieldName',
                        })}
                    </FormHelperText>
                ) : null}
            </Stack>
        </Stack>
    );
}

export default FieldEditor;
