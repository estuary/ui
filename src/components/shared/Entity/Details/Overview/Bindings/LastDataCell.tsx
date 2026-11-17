import type { SxProps, Theme } from '@mui/material';

import { Box, Skeleton, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';

import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';

interface Props {
    // Null when this binding moved nothing in the selected range, which is a
    // fact about the range rather than about the binding — so the cell stays
    // blank instead of claiming "never".
    lastPublishedAt: string | null;
    loading: boolean;
    sx?: SxProps<Theme>;
}

export function LastDataCell({ lastPublishedAt, loading, sx }: Props) {
    if (loading) {
        return (
            <TableCell align="right" sx={sx}>
                <Skeleton width={60} sx={{ display: 'inline-block' }} />
            </TableCell>
        );
    }

    if (!lastPublishedAt) {
        return <TableCell align="right" sx={sx} />;
    }

    const timestamp = DateTime.fromISO(lastPublishedAt);
    const elapsed = getElapsed(timestamp);

    return (
        <TableCell align="right" sx={sx}>
            <Tooltip
                placement="left"
                title={timestamp.toLocaleString(DateTime.DATETIME_FULL)}
            >
                <Typography
                    component="div"
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            fontVariantNumeric: 'tabular-nums',
                            minWidth: 20,
                            textAlign: 'right',
                        }}
                    >
                        {elapsed.value}
                    </Box>

                    <Box component="span" sx={{ pl: 0.5 }}>
                        {elapsed.unit} ago
                    </Box>
                </Typography>
            </Tooltip>
        </TableCell>
    );
}
