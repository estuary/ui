import type { DataByHourRange } from 'src/components/graphs/types';

import { Tooltip, Typography, useTheme } from '@mui/material';

import { defaultOutline, diminishedTextColor } from 'src/context/Theme';
import { getRangeLabel } from 'src/services/luxon';

interface Props {
    range: DataByHourRange;
}

/**
 * The timeframe a card's figures cover, as a quiet chip beside its heading.
 *
 * The picker itself sits on the chart card above, so without this a card of
 * totals further down the page states nothing about its own window.
 */
export function RangeChip({ range }: Props) {
    const theme = useTheme();

    return (
        <Tooltip
            placement="top"
            title="Covers the timeframe selected on the chart above."
        >
            <Typography
                component="span"
                sx={{
                    border: defaultOutline[theme.palette.mode],
                    borderRadius: 4,
                    color: diminishedTextColor[theme.palette.mode],
                    cursor: 'help',
                    fontSize: 12,
                    px: 1,
                    py: 0.125,
                    whiteSpace: 'nowrap',
                }}
            >
                {getRangeLabel(range)}
            </Typography>
        </Tooltip>
    );
}
