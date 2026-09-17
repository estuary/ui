import type { Theme } from '@mui/material';
import type { ComponentType, SVGProps } from 'react';
import type { BindingStatus } from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { Stack, TableCell, Tooltip, Typography, useTheme } from '@mui/material';

import {
    CheckCircleSolid,
    MinusCircleSolid,
    WarningCircleSolid,
} from 'iconoir-react';

import { diminishedTextColor } from 'src/context/Theme';

const ICON_SIZE = 14;

// Three states, not two: a binding can be switched on yet moving nothing. A
// task-wide connector failure is deliberately not one of them — that is a chip
// in the card header, because painting every row red on a shared failure stops
// this column telling rows apart.
type StatusVariant = 'enabled' | 'disabled' | 'warning';

// "Enabled" rather than "Active": the flag only says the binding is not
// switched off, which is not a claim that data is flowing.
const LABELS: Record<StatusVariant, string> = {
    enabled: 'Enabled',
    disabled: 'Disabled',
    warning: 'No data',
};

const TOOLTIPS: Partial<Record<StatusVariant, string>> = {
    warning: 'Enabled, but no documents were captured in the selected range.',
};

// A distinct icon per variant, not just a distinct colour, so the state reads
// without relying on hue.
const ICONS: Record<StatusVariant, ComponentType<SVGProps<SVGSVGElement>>> = {
    enabled: CheckCircleSolid,
    disabled: MinusCircleSolid,
    warning: WarningCircleSolid,
};

const getVariantColors = (
    theme: Theme
): Record<
    StatusVariant,
    { background: string | undefined; icon: string; text: string }
> => ({
    enabled: {
        icon: theme.palette.success.main,
        background: theme.palette.success.alpha_12,
        text: theme.palette.success.dark,
    },
    warning: {
        icon: theme.palette.warning.main,
        background: theme.palette.warning.alpha_12,
        text: theme.palette.warning.dark,
    },
    disabled: {
        icon: diminishedTextColor[theme.palette.mode],
        background: theme.palette.action.selected,
        text: diminishedTextColor[theme.palette.mode],
    },
});

interface Props {
    status: BindingStatus;
    // Whether the binding moved anything in the selected range. Undefined
    // while volumes are still loading, so the cell doesn't flash "no data"
    // for a binding that turns out to be busy once stats arrive.
    hasVolume?: boolean;
}

export function StatusCell({ status, hasVolume }: Props) {
    const theme = useTheme();

    const variant: StatusVariant =
        status === 'disabled'
            ? 'disabled'
            : hasVolume === false
              ? 'warning'
              : 'enabled';

    const {
        background: backgroundColor,
        icon: iconColor,
        text: textColor,
    } = getVariantColors(theme)[variant];

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
                {LABELS[variant]}
            </Typography>
        </Stack>
    );

    const tooltip = TOOLTIPS[variant];

    return (
        <TableCell>
            {tooltip ? (
                <Tooltip title={tooltip} placement="top">
                    {pill}
                </Tooltip>
            ) : (
                pill
            )}
        </TableCell>
    );
}
