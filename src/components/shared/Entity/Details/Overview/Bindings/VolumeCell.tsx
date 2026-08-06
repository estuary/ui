import {
    Box,
    Skeleton,
    TableCell,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { diminishedTextColor } from 'src/context/Theme';

// Enough to stay visible for a binding that moved a rounding error's worth of
// data next to one that moved a terabyte.
const MIN_VISIBLE_PERCENT = 1.5;

// Bar geometry is repeated by the loading branch so a range change does not
// change the row height while the new window is in flight.
const barSx = {
    borderRadius: 1,
    height: 3,
    mt: 0.5,
    overflow: 'hidden',
};

interface Props {
    bytes: number;
    // The selected range is still loading, so this binding's total for it is not
    // known yet. The number underneath belongs to the previous range and is only
    // there to hold the row's place in the sort — never render it.
    loading?: boolean;
    // Largest volume across the whole task. The bar is scaled to this rather
    // than to the page or to the total: against the total, every bar on a task
    // with many bindings would be a stub, and against the page the same binding
    // would change length as you paged.
    maxBytes: number;
    // Task total, used for the share figure in the tooltip — which is the number
    // someone actually wants ("this binding is a third of the traffic"), and is
    // not something a bar scaled to the largest binding can convey.
    totalBytes: number;
}

function VolumeCell({ bytes, loading, maxBytes, totalBytes }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    if (loading) {
        return (
            <TableCell align="right" sx={{ minWidth: 124 }}>
                <Box sx={{ display: 'inline-block', width: '100%' }}>
                    <Typography component="div">
                        <Skeleton width={64} sx={{ display: 'inline-block' }} />
                    </Typography>

                    <Box
                        sx={{
                            ...barSx,
                            backgroundColor: theme.palette.divider,
                        }}
                    />
                </Box>
            </TableCell>
        );
    }

    const percentOfMax =
        bytes === 0 || maxBytes === 0
            ? 0
            : Math.max(MIN_VISIBLE_PERCENT, (bytes / maxBytes) * 100);

    const shareOfTotal = totalBytes === 0 ? 0 : bytes / totalBytes;

    return (
        <TableCell align="right" sx={{ minWidth: 124 }}>
            <Tooltip
                placement="left"
                title={intl.formatMessage(
                    {
                        id:
                            bytes === 0
                                ? 'detailsPanel.bindings.volume.none.tooltip'
                                : 'detailsPanel.bindings.volume.tooltip',
                    },
                    {
                        share: intl.formatNumber(shareOfTotal, {
                            style: 'percent',
                            maximumFractionDigits: 1,
                        }),
                    }
                )}
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
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {formatBytes(bytes)}
                    </Typography>

                    <Box
                        sx={{
                            ...barSx,
                            backgroundColor: theme.palette.divider,
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: 1,
                                height: '100%',
                                width: `${percentOfMax}%`,
                            }}
                        />
                    </Box>
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default VolumeCell;
