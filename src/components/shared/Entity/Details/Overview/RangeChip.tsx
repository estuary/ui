import type { DataByHourRange } from 'src/components/graphs/types';

import { Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';
import { getRangeLabelDescriptor } from 'src/services/luxon';

interface Props {
    range: DataByHourRange;
}

/**
 * The timeframe a card's figures cover, as a quiet chip beside its heading.
 *
 * The picker itself sits on the chart card above, so a card of totals further
 * down the page states nothing about its own window. That is the kind of thing
 * which gets misread once and then never trusted.
 *
 * The label comes from `getRangeLabelDescriptor`, the same helper DetailsRange
 * labels its button with, so a chip can never word the window differently from
 * the control that set it.
 */
function RangeChip({ range }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const { id, values } = getRangeLabelDescriptor(range);

    return (
        <Tooltip
            placement="top"
            title={intl.formatMessage({ id: 'detailsPanel.rangeChip.tooltip' })}
        >
            <Typography
                component="span"
                sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                    color: diminishedTextColor[theme.palette.mode],
                    cursor: 'help',
                    fontSize: 12,
                    px: 1,
                    py: 0.125,
                    whiteSpace: 'nowrap',
                }}
            >
                {intl.formatMessage({ id }, values)}
            </Typography>
        </Tooltip>
    );
}

export default RangeChip;
