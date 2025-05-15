import type { ChipProps } from '@mui/material';
import type { CSSProperties } from 'react';

import { Chip, styled } from '@mui/material';

import { defaultOutline, diminishedTextColor } from 'src/context/Theme';

export const OutlinedChip = styled(Chip, {
    // TODO (typing): Consider creating a typed, utility function for this behavior.
    shouldForwardProp: (prop) => {
        const restrictedKeys = [
            'diminishedText',
            'maxWidth',
            'minWidth',
        ] as PropertyKey[];

        return !restrictedKeys.includes(prop);
    },
})<
    ChipProps & {
        diminishedText?: boolean;
        maxWidth?: CSSProperties['maxWidth'];
        minWidth?: CSSProperties['minWidth'];
    }
>(({ color, diminishedText, maxWidth, minWidth, theme }) => {
    const colorKey = color ?? 'default';

    const background =
        colorKey === 'default'
            ? theme.palette.background.default
            : theme.palette[colorKey].alpha_12;

    const border =
        colorKey === 'default'
            ? defaultOutline[theme.palette.mode]
            : `1px solid ${theme.palette[colorKey].alpha_50}`;

    return {
        'border': border,
        'maxWidth': maxWidth,
        // Specifying a minWidth helps prevent the SVG delete icon from
        // overlapping the label as the chip resizes.
        'minWidth': minWidth,
        '&:hover': {
            background,
            border:
                colorKey === 'default'
                    ? defaultOutline[theme.palette.mode]
                    : theme.palette.mode === 'light' &&
                        ['success', 'info'].includes(colorKey)
                      ? `1px solid ${theme.palette[colorKey].dark}`
                      : `1px solid ${theme.palette[colorKey].main}`,
        },
        '&:hover::after': { background },
        '&.MuiChip-deletable': {
            height: 'auto',
        },
        '& .MuiChip-deleteIcon': {
            'color':
                colorKey === 'default'
                    ? undefined
                    : theme.palette[colorKey].alpha_50,
            '&:hover': {
                color: theme.palette.error.main,
            },
        },
        '& .MuiChip-deleteIconSmall': {
            marginRight: '1px',
        },
        '& .MuiChip-label': {
            color: diminishedText
                ? diminishedTextColor[theme.palette.mode]
                : undefined,
            display: 'block',
            whiteSpace: 'normal',
        },

        // This is a hacky workaround that is needed because SVG delete icon
        // will shrink when resized to accommodate the label.
        '& svg': {
            minHeight: 21,
            minWidth: 21,
        },
    };
});
