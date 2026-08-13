import type { SxProps, Theme } from '@mui/material';

import {
    Box,
    Skeleton,
    TableCell,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    // Null when this binding moved nothing in the selected range, which is a
    // fact about the range rather than about the binding — so the cell stays
    // blank instead of claiming "never".
    lastPublishedAt: string | null;
    loading: boolean;
    // Lets the table nudge this last column's padding to align with the
    // card's own edge without every other cell needing the same override.
    sx?: SxProps<Theme>;
}

function LastDataCell({ lastPublishedAt, loading, sx }: Props) {
    const intl = useIntl();
    const theme = useTheme();

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
            {/* Uncoloured, whatever the age. A fixed staleness threshold was
                tried and does not survive the range picker: a capture stamps
                this when it publishes, so on a 6h range no capture binding can
                reach 24h and the warning is unreachable — while on a 30d range
                it lights up permanently for reference tables that update
                weekly by design, which is how a warning teaches people to stop
                reading it. Sorting the column finds the quiet bindings without
                asserting a threshold that has no stable meaning here. */}
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
                    {/* Fixed-width and right-aligned for the same reason as
                        the volume column's digit span: elapsed is always 1-2
                        digits (minutes top out at 59, hours at 23, days at the
                        30-day retention window), but "hour" vs "minutes" vs
                        "days" suffixes differ enough in width that without a
                        fixed box here, the digit itself drifts left and right
                        between rows as the suffix changes length. */}
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

                    {/* Unit and "ago" share the same dimmed treatment as the
                        volume column's byte-unit suffix, so both adjacent
                        numeric columns follow the same hierarchy convention. */}
                    <Box
                        component="span"
                        sx={{
                            color: diminishedTextColor[theme.palette.mode],
                            pl: 0.5,
                        }}
                    >
                        {intl.formatMessage(
                            { id: elapsed.unitLabelId },
                            { count: elapsed.value }
                        )}{' '}
                        {intl.formatMessage({
                            id: 'detailsPanel.elapsed.ago.suffix',
                        })}
                    </Box>
                </Typography>
            </Tooltip>
        </TableCell>
    );
}

export default LastDataCell;
