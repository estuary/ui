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

// formatBytes always renders 2 fraction digits ("1.20 GB", "854.00 MB"), but
// the unit segment's width still shifts the digits left/right between rows.
// Splitting the digits from the unit and right-aligning the digits in a fixed
// box keeps the decimal point lined up vertically down the column, the way
// Vercel's numeric table columns do.
//
// A plain split on the space `formatBytes` (via `prettyBytes`) always emits
// between the number and unit — verified against the library's default
// `space: true` behaviour, which this call never overrides — rather than a
// regex re-deriving a shape the string is already guaranteed to have.
function splitFormattedBytes(formatted: string): [string, string] {
    const spaceIndex = formatted.indexOf(' ');
    return spaceIndex === -1
        ? [formatted, '']
        : [formatted.slice(0, spaceIndex), formatted.slice(spaceIndex + 1)];
}

interface Props {
    bytes: number;
    // The selected range is still loading, so this binding's total for it is not
    // known yet. The number underneath belongs to the previous range and is only
    // there to hold the row's place in the sort — never render it.
    loading?: boolean;
    // Task total, used for the share figure in the tooltip — which is the
    // number someone actually wants ("this binding is a third of the
    // traffic").
    totalBytes: number;
}

function VolumeCell({ bytes, loading, totalBytes }: Props) {
    const intl = useIntl();
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
                                // No colour of its own: it inherits, which
                                // keeps the unit level with the digits it
                                // belongs to and still lets the zero-volume
                                // dimming on the parent carry through.
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

export default VolumeCell;
