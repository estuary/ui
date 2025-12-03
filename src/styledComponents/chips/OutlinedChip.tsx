import type { ChipProps } from '@mui/material';
import type { CSSProperties } from 'react';

import { Chip, chipClasses, styled } from '@mui/material';

import {
    defaultOutlineColor,
    defaultOutlineColor_hovered,
    diminishedTextColor,
} from 'src/context/Theme';

const customProps = ['diminishedText', 'disableCursor'] as const;

export const OutlinedChip = styled(Chip, {
    // TODO (typing): Consider creating a typed, utility function for property forwarding
    //   that is able to handle an array of properties.
    shouldForwardProp: (prop) =>
        !customProps.includes(prop as (typeof customProps)[number]),
})<
    ChipProps & {
        diminishedText?: boolean;
        disableCursor?: boolean;
    }
>(({ color, diminishedText, disableCursor, style, theme }) => {
    const colorKey = color ?? 'default';

    const background =
        colorKey === 'default'
            ? theme.palette.background.default
            : theme.palette[colorKey].alpha_12;

    const borderStyle: CSSProperties['borderStyle'] = diminishedText
        ? 'dashed'
        : 'solid';

    const border =
        colorKey === 'default'
            ? `1px ${borderStyle} ${defaultOutlineColor[theme.palette.mode]}`
            : `1px ${borderStyle} ${theme.palette[colorKey].alpha_50}`;

    return {
        'border': border,
        'cursor': disableCursor ? 'default' : 'pointer',
        'height': 'auto',
        'minHeight': 23,
        '&:hover': {
            background,
            border:
                colorKey === 'default'
                    ? `1px ${borderStyle} ${defaultOutlineColor_hovered[theme.palette.mode]}`
                    : theme.palette.mode === 'light' &&
                        ['success', 'info'].includes(colorKey)
                      ? `1px ${borderStyle} ${theme.palette[colorKey].dark}`
                      : `1px ${borderStyle} ${theme.palette[colorKey].main}`,
        },
        '&:hover::after': { background },
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
        [`& .${chipClasses.label}`]: {
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

        // Specifying a minWidth helps prevent the SVG delete icon from
        // overlapping the label as the chip resizes.
        ...style,
    };
});
