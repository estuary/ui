import { ArrowRight, CheckCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { Stack, TextField, Typography, useTheme } from '@mui/material';

interface Props {
    labelMessageId: string;
    value: string;
    disabled?: boolean;
}

function FieldEditor({ labelMessageId, value, disabled }: Props) {
    const theme = useTheme();

    return (
        <Stack
            spacing={2}
            direction="row"
            sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography sx={{ fontWeight: 500 }}>
                <FormattedMessage id={labelMessageId} />
            </Typography>

            <Stack spacing={2} direction="row" sx={{ alignItems: 'center' }}>
                <Typography>{value}</Typography>

                <ArrowRight
                    style={{
                        fontSize: 12,
                        color: theme.palette.text.primary,
                    }}
                />

                <Stack
                    spacing={1}
                    direction="row"
                    sx={{ alignItems: 'center' }}
                >
                    <TextField
                        disabled={disabled}
                        size="small"
                        defaultValue={disabled ? value : ''}
                        sx={{
                            '& .MuiInputBase-root': {
                                borderRadius: 3,
                            },
                        }}
                    />

                    <CheckCircle
                        style={{
                            fontSize: 14,
                            color: theme.palette.success.main,
                        }}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}

export default FieldEditor;
