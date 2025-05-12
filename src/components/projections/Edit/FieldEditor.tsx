import type { FieldEditorProps } from 'src/components/projections/Edit/types';

import { Stack, TextField, Typography, useTheme } from '@mui/material';

import { ArrowRight } from 'iconoir-react';

import { diminishedTextColor } from 'src/context/Theme';

function FieldEditor({ disabled, input, setInput, value }: FieldEditorProps) {
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
                    flex: '1 1 0px',
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
                value={input}
                onChange={(event) => {
                    setInput(event.target.value);
                }}
                size="small"
                sx={{
                    'flex': '1 1 0px',
                    '& .MuiInputBase-root': {
                        borderRadius: 3,
                    },
                }}
            />
        </Stack>
    );
}

export default FieldEditor;
