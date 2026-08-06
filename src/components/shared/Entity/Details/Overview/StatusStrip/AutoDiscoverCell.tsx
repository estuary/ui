import { Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { DateTime } from 'luxon';
import { useIntl } from 'react-intl';

import StripCell from 'src/components/shared/Entity/Details/Overview/StatusStrip/StripCell';
import { diminishedTextColor, errorMain } from 'src/context/Theme';
import {
    useEntityStatusStore_autoDiscoverFailure,
    useEntityStatusStore_autoDiscoverLastSuccess,
    useEntityStatusStore_autoDiscoverNextAt,
} from 'src/stores/EntityStatus/hooks';

interface LineProps {
    labelId: string;
    color?: string;
    // Raw ISO timestamp; the line renders the rounded form and keeps the exact
    // one on hover.
    timestamp: string | undefined;
}

function Line({ color, labelId, timestamp }: LineProps) {
    const intl = useIntl();
    const theme = useTheme();

    const dateTime = timestamp ? DateTime.fromISO(timestamp) : null;

    const value = dateTime?.isValid
        ? dateTime.toRelative({ style: 'narrow' })
        : intl.formatMessage({ id: 'detailsPanel.strip.never' });

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'baseline',
                columnGap: 1,
                fontSize: 13,
                justifyContent: 'space-between',
            }}
        >
            <Typography
                component="div"
                sx={{
                    color: diminishedTextColor[theme.palette.mode],
                    fontSize: 13,
                }}
            >
                {intl.formatMessage({ id: labelId })}
            </Typography>

            {/* "2 hr. ago" and "in 4 min." are rounded, so the precise time has
                to stay reachable — same treatment the footer timestamps get. */}
            <Tooltip
                placement="top"
                title={
                    dateTime?.isValid
                        ? dateTime.toLocaleString(DateTime.DATETIME_FULL)
                        : ''
                }
            >
                <Typography
                    component="div"
                    sx={{
                        color,
                        cursor: dateTime?.isValid ? 'help' : undefined,
                        fontSize: 13,
                        fontWeight: 500,
                    }}
                >
                    {value}
                </Typography>
            </Tooltip>
        </Stack>
    );
}

interface Props {
    entityName: string;
}

// Captures only: materializations have no auto-discover.
function AutoDiscoverCell({ entityName }: Props) {
    const failure = useEntityStatusStore_autoDiscoverFailure(entityName);
    const lastSuccess =
        useEntityStatusStore_autoDiscoverLastSuccess(entityName);
    const nextAt = useEntityStatusStore_autoDiscoverNextAt(entityName);

    // A jammed auto-discover blocks unrelated schema changes from publishing, so
    // a failing one is worth colouring rather than reporting flatly.
    const failing = Boolean(failure?.count);

    return (
        <StripCell labelId="detailsPanel.strip.autoDiscover">
            <Line
                color={failing ? errorMain : undefined}
                labelId="detailsPanel.strip.autoDiscover.last"
                timestamp={
                    failing ? failure?.last_outcome?.ts : lastSuccess?.ts
                }
            />

            <Line
                labelId="detailsPanel.strip.autoDiscover.next"
                timestamp={nextAt}
            />
        </StripCell>
    );
}

export default AutoDiscoverCell;
