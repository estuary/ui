import type { Theme } from '@mui/material';
import type { ComponentType, SVGProps } from 'react';

import { Stack, Tooltip, Typography, useTheme } from '@mui/material';

import {
    CheckCircleSolid,
    MinusCircleSolid,
    WarningCircleSolid,
} from 'iconoir-react';

import { diminishedTextColor } from 'src/context/Theme';

export type StatusPillVariant = 'enabled' | 'disabled' | 'warning';

const ICON_SIZE = 14;

// A distinct icon per variant, not just a distinct colour, so the state reads
// without relying on hue.
const ICONS: Record<
    StatusPillVariant,
    ComponentType<SVGProps<SVGSVGElement>>
> = {
    enabled: CheckCircleSolid,
    disabled: MinusCircleSolid,
    warning: WarningCircleSolid,
};

const getVariantColors = (
    theme: Theme
): Record<
    StatusPillVariant,
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
    variant: StatusPillVariant;
    label: string;
    tooltip?: string;
}

export function StatusPill({ variant, label, tooltip }: Props) {
    const theme = useTheme();

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
                {label}
            </Typography>
        </Stack>
    );

    return tooltip ? (
        <Tooltip title={tooltip} placement="top">
            {pill}
        </Tooltip>
    ) : (
        pill
    );
}
