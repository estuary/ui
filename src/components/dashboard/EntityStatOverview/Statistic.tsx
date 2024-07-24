import { Box, Typography } from '@mui/material';
import prettyBytes from 'pretty-bytes';
import { ReactNode } from 'react';

interface Props {
    label: ReactNode;
    value: number;
    byteUnit?: boolean;
}

export default function Statistic({ label, value, byteUnit }: Props) {
    return (
        <Box
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                paddingRight: 8,
            }}
        >
            <Typography variant="caption">{label}</Typography>

            <Typography variant="h6">
                {byteUnit
                    ? prettyBytes(value, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                    : value}
            </Typography>
        </Box>
    );
}
