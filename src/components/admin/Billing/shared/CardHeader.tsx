import type { Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { Stack, Typography } from '@mui/material';

import { diminishedTextColor } from 'src/context/Theme';

export const cardTitleSx = {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.5,
};

// Grey in both modes, where `text.secondary` is blue in light mode.
export const captionColor = (theme: Theme) =>
    diminishedTextColor[theme.palette.mode];

export const captionSx = { fontSize: 13, color: captionColor };

export const numericSx = { fontVariantNumeric: 'tabular-nums' };

// The hairline between a card's sections, which run edge to edge.
export const ruleSx = {
    borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
};

interface Props {
    title: ReactNode;
    caption?: ReactNode;
}

// A card's title, with an optional caption at the end of the same line.
export function CardHeader({ title, caption }: Props) {
    return (
        <Stack
            direction="row"
            sx={{
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                columnGap: 2,
                rowGap: 0.5,
            }}
        >
            <Typography component="h2" sx={cardTitleSx}>
                {title}
            </Typography>

            {caption ? (
                <Typography
                    component="span"
                    sx={{ ...captionSx, ...numericSx }}
                >
                    {caption}
                </Typography>
            ) : null}
        </Stack>
    );
}
