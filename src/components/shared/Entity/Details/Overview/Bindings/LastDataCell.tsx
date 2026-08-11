import { Skeleton, TableCell, Tooltip, Typography } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import { getElapsed } from 'src/components/shared/Entity/Details/Overview/shared';

interface Props {
    // Null when this binding moved nothing in the selected range, which is a
    // fact about the range rather than about the binding — so the cell stays
    // blank instead of claiming "never".
    lastPublishedAt: string | null;
    loading: boolean;
}

function LastDataCell({ lastPublishedAt, loading }: Props) {
    const intl = useIntl();

    if (loading) {
        return (
            <TableCell align="right">
                <Skeleton width={60} sx={{ display: 'inline-block' }} />
            </TableCell>
        );
    }

    if (!lastPublishedAt) {
        return <TableCell align="right" />;
    }

    const timestamp = DateTime.fromISO(lastPublishedAt);
    const elapsed = getElapsed(timestamp);

    return (
        <TableCell align="right">
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
                <Typography component="div" sx={{ whiteSpace: 'nowrap' }}>
                    {intl.formatMessage(
                        { id: 'detailsPanel.elapsed.ago' },
                        {
                            elapsed: `${elapsed.value} ${intl.formatMessage(
                                { id: elapsed.unitLabelId },
                                { count: elapsed.value }
                            )}`,
                        }
                    )}
                </Typography>
            </Tooltip>
        </TableCell>
    );
}

export default LastDataCell;
