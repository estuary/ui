import { Box, Skeleton, TableCell, Typography, useTheme } from '@mui/material';

import { splitFormattedBytes } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    bytes: number;
    // The selected range is still loading, so this binding's total for it is not
    // known yet. The number underneath belongs to the previous range and is only
    // there to hold the row's place in the sort — never render it.
    loading?: boolean;
    // Stats failed, so `bytes` is a placeholder zero rather than a reading.
    unavailable?: boolean;
}

export function VolumeCell({ bytes, loading, unavailable }: Props) {
    const theme = useTheme();

    if (loading) {
        return (
            <TableCell align="right" sx={{ minWidth: 124 }}>
                <Skeleton width={64} sx={{ display: 'inline-block' }} />
            </TableCell>
        );
    }

    if (unavailable) {
        return (
            <TableCell
                align="right"
                sx={{
                    color: diminishedTextColor[theme.palette.mode],
                    minWidth: 124,
                }}
            >
                &mdash;
            </TableCell>
        );
    }

    const [digits, unit] = splitFormattedBytes(formatBytes(bytes));

    return (
        <TableCell align="right" sx={{ minWidth: 124 }}>
            <Typography
                component="div"
                sx={{
                    color:
                        bytes === 0
                            ? diminishedTextColor[theme.palette.mode]
                            : undefined,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    whiteSpace: 'nowrap',
                }}
            >
                <Box
                    component="span"
                    sx={{
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 48,
                        textAlign: 'right',
                    }}
                >
                    {digits}
                </Box>

                <Box
                    component="span"
                    sx={{
                        // No colour of its own, so the parent's
                        // zero-volume dimming carries through.
                        minWidth: 30,
                        pl: 0.5,
                        textAlign: 'left',
                    }}
                >
                    {unit}
                </Box>
            </Typography>
        </TableCell>
    );
}
