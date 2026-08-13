import type { ComponentType, SVGProps } from 'react';
import type { BindingStatus } from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { Stack, TableCell, Tooltip, Typography, useTheme } from '@mui/material';

import {
    CheckCircleSolid,
    MinusCircleSolid,
    WarningCircleSolid,
} from 'iconoir-react';
import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';

const ICON_SIZE = 14;

// Three visual states, not two. "Enabled" alone answers "is this switched on?",
// which is not the question a status column should be answering — the state
// worth surfacing at a glance is whether the binding is actually moving
// anything. Whether the task's *connector* is erroring is a task-wide signal
// (surfaced instead as a chip in the card header, see BindingsCardHeader) —
// painting every enabled row identically red on a shared failure defeats the
// one job this column has, telling rows apart from each other.
type StatusVariant = 'enabled' | 'disabled' | 'warning';

const LABEL_IDS: Record<StatusVariant, string> = {
    enabled: 'detailsPanel.bindings.status.enabled',
    disabled: 'detailsPanel.bindings.status.disabled',
    warning: 'detailsPanel.bindings.status.noData',
};

const TOOLTIP_IDS: Partial<Record<StatusVariant, string>> = {
    warning: 'detailsPanel.bindings.status.noData.tooltip',
};

// A distinct icon per variant, not just a distinct color, so the state reads
// at a glance even to someone who can't rely on hue (and so it survives a
// screenshot in grayscale). Solid glyphs match the filled-pill treatment used
// across all three states, so they read as one vocabulary.
const ICONS: Record<StatusVariant, ComponentType<SVGProps<SVGSVGElement>>> = {
    enabled: CheckCircleSolid,
    disabled: MinusCircleSolid,
    warning: WarningCircleSolid,
};

interface Props {
    status: BindingStatus;
    // Whether the binding moved anything in the selected range. Undefined
    // while volumes are still loading, so the cell doesn't flash "no data"
    // for a binding that turns out to be busy once stats arrive.
    hasVolume?: boolean;
}

function StatusCell({ status, hasVolume }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const variant: StatusVariant =
        status === 'disabled'
            ? 'disabled'
            : hasVolume === false
              ? 'warning'
              : 'enabled';

    // A pill per variant: filled success for a binding actually moving data,
    // filled warning for one that's on but merely silent, and a hollow
    // neutral pill for one switched off outright — so "off" reads as absent
    // rather than merely quieter than "on but stuck", which is the
    // distinction that matters at a glance.
    const iconColor =
        variant === 'enabled'
            ? theme.palette.success.main
            : variant === 'warning'
              ? theme.palette.warning.main
              : diminishedTextColor[theme.palette.mode];

    const backgroundColor =
        variant === 'enabled'
            ? theme.palette.success.alpha_12
            : variant === 'warning'
              ? theme.palette.warning.alpha_12
              : theme.palette.action.selected;

    const textColor =
        variant === 'enabled'
            ? theme.palette.success.dark
            : variant === 'warning'
              ? theme.palette.warning.dark
              : diminishedTextColor[theme.palette.mode];

    const Icon = ICONS[variant];

    const pill = (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{
                alignItems: 'center',
                backgroundColor,
                borderRadius: 5,
                display: 'inline-flex',
                lineHeight: 1,
                px: 1,
                py: 0.375,
                width: 'fit-content',
            }}
        >
            <Icon
                height={ICON_SIZE}
                width={ICON_SIZE}
                color={iconColor}
                strokeWidth={2}
                style={{ flex: 'none' }}
            />

            <Typography
                component="div"
                variant="body2"
                sx={{
                    color: textColor,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                }}
            >
                {intl.formatMessage({ id: LABEL_IDS[variant] })}
            </Typography>
        </Stack>
    );

    const tooltipId = TOOLTIP_IDS[variant];

    return (
        <TableCell>
            {tooltipId ? (
                <Tooltip
                    title={intl.formatMessage({ id: tooltipId })}
                    placement="top"
                >
                    {pill}
                </Tooltip>
            ) : (
                pill
            )}
        </TableCell>
    );
}

export default StatusCell;
