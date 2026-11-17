import type { ReactNode } from 'react';

import { Box, Tooltip, Typography } from '@mui/material';

import { formatBytes } from 'src/components/tables/cells/stats/shared';

interface Props {
    label: ReactNode;
    loading: boolean;
    tooltip: string;
    value: number;
    byteUnit?: boolean;
    error?: boolean;
    indeterminate?: boolean;
}

export default function Statistic({
    byteUnit,
    error,
    indeterminate,
    label,
    loading,
    tooltip,
    value,
}: Props) {
    return (
        <Box
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                paddingRight: 8,
            }}
        >
            <Typography variant="caption">{label}</Typography>

            <Tooltip
                placement="bottom"
                title={error ? 'Failed to fetch stats.' : tooltip}
            >
                <Typography
                    variant="h6"
                    sx={{ opacity: loading || error ? 0.4 : 1 }}
                >
                    {`${byteUnit ? formatBytes(value) : value}${
                        indeterminate ? '+' : ''
                    }`}
                </Typography>
            </Tooltip>
        </Box>
    );
}
