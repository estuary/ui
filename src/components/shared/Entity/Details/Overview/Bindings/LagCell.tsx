import type { SxProps, Theme } from '@mui/material';

import { Box, Skeleton, TableCell, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { secondsToElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';

// formatBytes always renders 2 fraction digits ("1.20 GB", "854.00 MB"), but
// the unit segment's width still shifts the digits left/right between rows.
// Splitting the digits from the unit and right-aligning the digits in a fixed
// box keeps the decimal point lined up vertically down the column — the same
// treatment VolumeCell gives its own byte figure, duplicated here rather than
// imported because it is six lines closely tied to this file's own layout.
function splitFormattedBytes(formatted: string): [string, string] {
    const spaceIndex = formatted.indexOf(' ');
    return spaceIndex === -1
        ? [formatted, '']
        : [formatted.slice(0, spaceIndex), formatted.slice(spaceIndex + 1)];
}

type LagKind = 'bytes' | 'seconds';

// One tooltip per kind, plus a "no reading" variant for null — both kinds share
// the same reasons a reading can be absent (see BindingRow.bytesBehind), so the
// wording only needs to change with the unit.
const TOOLTIP_IDS: Record<LagKind, { none: string; value: string }> = {
    bytes: {
        value: 'detailsPanel.bindings.bytesBehind.tooltip',
        none: 'detailsPanel.bindings.bytesBehind.none.tooltip',
    },
    seconds: {
        value: 'detailsPanel.bindings.secondsBehind.tooltip',
        none: 'detailsPanel.bindings.secondsBehind.none.tooltip',
    },
};

interface Props {
    kind: LagKind;
    // The selected range's own load is irrelevant to this column — see the note
    // on `BindingRow.bytesBehind` — but it still arrives after the spec, on the
    // same backlog request the rest of the row's numbers wait on.
    loading?: boolean;
    // Lets the table nudge padding to align with the card's own edge when this
    // is the last cell on the row, the same knob `LastDataCell` takes.
    sx?: SxProps<Theme>;
    // Null means no reading (every capture binding, and a materialization
    // binding absent from the latest one); zero means caught up. The two are
    // rendered differently on purpose — see `BindingRow.bytesBehind`.
    value: number | null;
}

function LagCell({ kind, loading, sx, value }: Props) {
    const intl = useIntl();

    if (loading) {
        return (
            <TableCell align="right" sx={{ minWidth: 96, ...sx }}>
                <Skeleton width={48} sx={{ display: 'inline-block' }} />
            </TableCell>
        );
    }

    if (value === null) {
        return (
            <TableCell align="right" sx={{ minWidth: 96, ...sx }}>
                <Tooltip
                    placement="left"
                    title={intl.formatMessage({ id: TOOLTIP_IDS[kind].none })}
                >
                    <Box sx={{ cursor: 'help', display: 'inline-block' }}>
                        &mdash;
                    </Box>
                </Tooltip>
            </TableCell>
        );
    }

    const tooltip = intl.formatMessage({ id: TOOLTIP_IDS[kind].value });

    if (value === 0) {
        return (
            <TableCell align="right" sx={{ minWidth: 96, ...sx }}>
                <Tooltip placement="left" title={tooltip}>
                    <Typography component="div" sx={{ cursor: 'help' }}>
                        {intl.formatMessage({
                            id: 'detailsPanel.bindings.behind.caughtUp',
                        })}
                    </Typography>
                </Tooltip>
            </TableCell>
        );
    }

    const [digits, unit] =
        kind === 'bytes'
            ? splitFormattedBytes(formatBytes(value))
            : (() => {
                  const elapsed = secondsToElapsed(value);

                  return [
                      String(elapsed.value),
                      intl.formatMessage(
                          { id: elapsed.unitLabelId },
                          { count: elapsed.value }
                      ),
                  ];
              })();

    return (
        <TableCell align="right" sx={{ minWidth: 96, ...sx }}>
            <Tooltip placement="left" title={tooltip}>
                <Typography
                    component="div"
                    sx={{
                        cursor: 'help',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            fontVariantNumeric: 'tabular-nums',
                            minWidth: kind === 'bytes' ? 48 : 20,
                            textAlign: 'right',
                        }}
                    >
                        {digits}
                    </Box>

                    <Box
                        component="span"
                        sx={{
                            minWidth: kind === 'bytes' ? 30 : undefined,
                            pl: 0.5,
                            textAlign: 'left',
                        }}
                    >
                        {unit}
                    </Box>
                </Typography>
            </Tooltip>
        </TableCell>
    );
}

export default LagCell;
