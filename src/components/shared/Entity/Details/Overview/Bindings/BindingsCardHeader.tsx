import type { DataByHourRange } from 'src/components/graphs/types';
import type { Entity } from 'src/types';

import { Skeleton, Stack, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import RangeChip from 'src/components/shared/Entity/Details/Overview/RangeChip';
import { OVERVIEW_CARD_TITLE_SX } from 'src/components/shared/Entity/Details/Overview/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';
import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    count: number;
    entityType: Entity;
    // Volumes for the selected range are still loading, so the total below them
    // is not known yet.
    loading: boolean;
    // The chart's range, so the chip states the window these figures cover.
    range: DataByHourRange;
    totalBytes: number;
}

/**
 * The Bindings card heading and its summary line.
 *
 * A component rather than inline markup so the Storybook harness renders the
 * same heading as the page does — an inline copy had already drifted on font
 * weight, which made a review screenshot show something the app never showed.
 */
function BindingsCardHeader({
    count,
    entityType,
    loading,
    range,
    totalBytes,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'baseline',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                width: '100%',
            }}
        >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography component="span" sx={OVERVIEW_CARD_TITLE_SX}>
                    {intl.formatMessage({ id: 'detailsPanel.bindings.title' })}
                </Typography>

                <RangeChip range={range} />
            </Stack>

            <Typography
                component="div"
                sx={{
                    color: diminishedTextColor[theme.palette.mode],
                    fontSize: 13,
                    fontWeight: 400,
                }}
            >
                {loading ? (
                    <Skeleton width={168} sx={{ display: 'inline-block' }} />
                ) : (
                    intl.formatMessage(
                        {
                            id:
                                entityType === 'materialization'
                                    ? 'detailsPanel.bindings.subtitle.read'
                                    : 'detailsPanel.bindings.subtitle.written',
                        },
                        { count, volume: formatBytes(totalBytes) }
                    )
                )}
            </Typography>
        </Stack>
    );
}

export default BindingsCardHeader;
