import { Box, Skeleton, Typography } from '@mui/material';
import prettyBytes from 'pretty-bytes';
import { ReactNode } from 'react';

interface Props {
    label: ReactNode;
    loading: boolean;
    value: number;
    byteUnit?: boolean;
}

export default function Statistic({ label, loading, value, byteUnit }: Props) {
    return (
        <Box
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                paddingRight: 8,
            }}
        >
            <Typography variant="caption">{label}</Typography>

            {loading ? (
                <Skeleton height={32} width={64} />
            ) : (
                <Typography variant="h6">
                    {byteUnit
                        ? prettyBytes(value, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })
                        : value}
                </Typography>
            )}
        </Box>
    );
}
