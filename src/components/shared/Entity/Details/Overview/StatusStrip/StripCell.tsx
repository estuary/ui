import type { ReactNode } from 'react';

import { Stack, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    children: ReactNode;
    labelId: string;
}

/**
 * One fact in the status strip.
 *
 * Labels are sentence case: weight and colour carry the label/value distinction
 * that capitals and letter-spacing used to do.
 */
function StripCell({ children, labelId }: Props) {
    const intl = useIntl();
    const theme = useTheme();

    return (
        // A bordered card rather than a slice of one. Its own border on four
        // sides means it never has to work out whether it starts a row, which
        // is the question every divider-based version got wrong.
        <Stack
            sx={{
                border: `1px solid ${theme.palette.divider}`,
                // Matches CardWrapper, so these read as the same family of card
                // as the chart and the bindings table rather than as insets.
                borderRadius: 3,
                gap: 0.75,
                minWidth: 0,
                px: 2,
                py: 1.5,
            }}
        >
            <Typography
                component="div"
                sx={{
                    color: diminishedTextColor[theme.palette.mode],
                    fontSize: 12.5,
                    fontWeight: 600,
                }}
            >
                {intl.formatMessage({ id: labelId })}
            </Typography>

            {children}
        </Stack>
    );
}

export default StripCell;
