import {
    Box,
    Skeleton,
    TableCell,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { splitFormattedBytes } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { diminishedTextColor } from 'src/context/Theme';

const percentFormat = new Intl.NumberFormat(undefined, {
    style: 'percent',
    maximumFractionDigits: 1,
});

interface Props {
    bytes: number;
    // The selected range is still loading, so this binding's total for it is not
    // known yet. The number underneath belongs to the previous range and is only
    // there to hold the row's place in the sort — never render it.
    loading?: boolean;
    // Task total, used for the share figure in the tooltip.
    totalBytes: number;
}

export function VolumeCell({ bytes, loading, totalBytes }: Props) {
    const theme = useTheme();

    if (loading) {
        return (
            <TableCell align="right" sx={{ minWidth: 124 }}>
                <Skeleton width={64} sx={{ display: 'inline-block' }} />
            </TableCell>
        );
    }

    const shareOfTotal = totalBytes === 0 ? 0 : bytes / totalBytes;

    const [digits, unit] = splitFormattedBytes(formatBytes(bytes));

    return (
        <TableCell align="right" sx={{ minWidth: 124 }}>
            <Tooltip
                placement="left"
                title={
                    bytes === 0
                        ? 'No data recorded for this binding in the selected range.'
                        : `${percentFormat.format(shareOfTotal)} of this task's total volume for the selected range — not a lag or progress indicator. Bar length is relative to the busiest collection.`
                }
            >
                <Box
                    sx={{
                        cursor: 'help',
                        display: 'inline-block',
                        width: '100%',
                    }}
                >
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
                </Box>
            </Tooltip>
        </TableCell>
    );
}
