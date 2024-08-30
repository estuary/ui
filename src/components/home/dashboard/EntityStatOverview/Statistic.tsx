import { Box, Tooltip, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { formatBytes } from 'components/tables/cells/stats/shared';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    label: ReactNode;
    loading: boolean;
    tooltip: string;
    value: number;
    byteUnit?: boolean;
    error?: PostgrestError;
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
    const intl = useIntl();

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
                title={
                    error
                        ? intl.formatMessage({ id: 'entityTable.stats.error' })
                        : tooltip
                }
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
