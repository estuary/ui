import { Stack, TextField, Typography, useTheme } from '@mui/material';

import { ArrowRight } from 'iconoir-react';

import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    labelMessageId: string;
    value: string;
    disabled?: boolean;
}

function FieldEditor({ value, disabled }: Props) {
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
            <Typography
                style={{
                    borderBottom: `1px dashed ${diminishedTextColor[theme.palette.mode]}`,
                    color: diminishedTextColor[theme.palette.mode],
                    flexGrow: 1,
                    paddingBottom: 4,
                    paddingTop: 1,
                }}
            >
                {value}
            </Typography>

            <ArrowRight
                style={{
                    fontSize: 12,
                    color: theme.palette.text.primary,
                }}
            />

            <TextField
                disabled={disabled}
                size="small"
                defaultValue={disabled ? value : ''}
                sx={{
                    'flexGrow': 1,
                    '& .MuiInputBase-root': {
                        borderRadius: 3,
                    },
                }}
            />
        </Stack>
    );
}

export default FieldEditor;
