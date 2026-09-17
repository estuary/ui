import type { SxProps, Theme } from '@mui/material';

import { Box, Skeleton, TableCell, Tooltip, Typography } from '@mui/material';

import { splitFormattedBytes } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { secondsToElapsed } from 'src/components/shared/Entity/Details/Overview/shared';
import { formatBytes } from 'src/components/tables/cells/stats/shared';

type LagKind = 'bytes' | 'seconds';

// Both figures read from a gauge that is only re-anchored on a fresh reading,
// not recomputed live, so a binding that has caught up can still show a stale
// nonzero figure. Hence the hedge in both tooltips.
const TOOLTIPS: Record<LagKind, { none: string; value: string }> = {
    bytes: {
        value: "Bytes still to write, as of the task's last stats reading rather than the selected range. Directional, not exact.",
        none: 'No backlog reading yet for this binding.',
    },
    seconds: {
        value: "Lag in source-publication time, as of the task's last stats reading rather than the selected range. Directional, not exact.",
        none: 'No time-lag reading yet for this binding.',
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

export function LagCell({ kind, loading, sx, value }: Props) {
    const content = (() => {
        if (loading) {
            return <Skeleton width={48} sx={{ display: 'inline-block' }} />;
        }

        if (value === null) {
            return (
                <Tooltip placement="left" title={TOOLTIPS[kind].none}>
                    <Box sx={{ cursor: 'help', display: 'inline-block' }}>
                        &mdash;
                    </Box>
                </Tooltip>
            );
        }

        const tooltip = TOOLTIPS[kind].value;

        if (value === 0) {
            return (
                <Tooltip placement="left" title={tooltip}>
                    <Typography component="div" sx={{ cursor: 'help' }}>
                        Caught up
                    </Typography>
                </Tooltip>
            );
        }

        const [digits, unit] =
            kind === 'bytes'
                ? splitFormattedBytes(formatBytes(value))
                : (() => {
                      const elapsed = secondsToElapsed(value);

                      return [String(elapsed.value), elapsed.unit];
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
