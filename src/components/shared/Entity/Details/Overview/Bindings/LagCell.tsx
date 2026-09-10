import type { SxProps, Theme } from '@mui/material';

import { Box, Skeleton, TableCell, Tooltip, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { splitFormattedBytes } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { secondsToElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';

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

    const content = (() => {
        if (loading) {
            return <Skeleton width={48} sx={{ display: 'inline-block' }} />;
        }

        if (value === null) {
            return (
                <Tooltip
                    placement="left"
                    title={intl.formatMessage({ id: TOOLTIP_IDS[kind].none })}
                >
                    <Box sx={{ cursor: 'help', display: 'inline-block' }}>
                        &mdash;
                    </Box>
                </Tooltip>
            );
        }

        const tooltip = intl.formatMessage({ id: TOOLTIP_IDS[kind].value });

        if (value === 0) {
            return (
                <Tooltip placement="left" title={tooltip}>
                    <Typography component="div" sx={{ cursor: 'help' }}>
                        {intl.formatMessage({
                            id: 'detailsPanel.bindings.behind.caughtUp',
                        })}
                    </Typography>
                </Tooltip>
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
        );
    })();

    return (
        <TableCell align="right" sx={{ minWidth: 96, ...sx }}>
            {content}
        </TableCell>
    );
}

export default LagCell;
