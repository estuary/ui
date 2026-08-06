import type { DataByHourRange } from 'src/components/graphs/types';

import { Tooltip, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';
import { LUXON_GRAIN_SETTINGS } from 'src/services/luxon';

interface Props {
    range: DataByHourRange;
}

/**
 * The timeframe a card's figures cover, as a quiet chip beside its heading.
 *
 * Shared by every card the range governs. The picker itself sits in the page
 * toolbar, which is far from the bindings table and above the fold on a long
 * page — a card of totals whose window is only stated somewhere else is the
 * kind of thing that gets misread once and then never trusted.
 *
 * The label comes from the same two message keys DetailsRange labels its button
 * with, so a chip can never word the window differently from the control that
 * set it.
 */
function RangeChip({ range }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const { relativeUnit, selectedLabelKey } =
        LUXON_GRAIN_SETTINGS[range.grain];

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
                {intl.formatMessage(
                    {
                        id:
                            selectedLabelKey ??
                            `detailsPanel.recentUsage.filter.label.${relativeUnit}`,
                    },
                    { range: range.amount }
                )}
            </Typography>
        </Tooltip>
    );
}

export default RangeChip;
