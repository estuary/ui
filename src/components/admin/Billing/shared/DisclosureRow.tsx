import type { Theme } from '@mui/material';
import type { ReactNode } from 'react';

import { useState } from 'react';

import { alpha, Box, ButtonBase, useTheme } from '@mui/material';

import { NavArrowRight } from 'iconoir-react';

interface Props {
    // The row's content after its chevron.
    summary: ReactNode;
    // What opening the row shows, usually rows styled with `panelRowSx`.
    children: ReactNode;
    // Rows among padded content keep their top rule within the padding.
    insetRule?: boolean;
}

// A full-width row that opens to show its detail in an inset panel.
export function DisclosureRow({ summary, children, insetRule }: Props) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const rule = `1px solid ${theme.palette.divider}`;

    return (
        <Box
            sx={{
                position: 'relative',
                // An open row tints as one block, so its panel reads as part
                // of the row rather than butting up against its hover band.
                bgcolor: open ? 'action.hover' : undefined,
                borderTop: insetRule ? undefined : rule,
                ...(insetRule && {
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: theme.spacing(3),
                        right: theme.spacing(3),
                        borderTop: rule,
                    },
                }),
            }}
        >
            <ButtonBase
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                sx={{
                    'display': 'grid',
                    'gridTemplateColumns': '16px minmax(0, 1fr)',
                    'columnGap': 2,
                    'alignItems': 'center',
                    'width': '100%',
                    'px': 3,
                    'py': 1.5,
                    'font': 'inherit',
                    'textAlign': 'left',
                    '&:hover': open ? undefined : { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: -2,
                    },
                }}
            >
                <NavArrowRight
                    height={16}
                    width={16}
                    strokeWidth={1.6}
                    style={{
                        color: theme.palette.text.disabled,
                        transform: open ? 'rotate(90deg)' : 'none',
                        transition: 'transform 150ms',
                    }}
                />
                {summary}
            </ButtonBase>

            {open ? (
                <Box
                    sx={{
                        mx: 3,
                        mt: 0.5,
                        mb: 2,
                        px: 2,
                        py: 0.75,
                        borderRadius: 3,
                        fontSize: 13,
                        // Darker than the card in dark mode, as an inset.
                        bgcolor: alpha(
                            theme.palette.background.default,
                            theme.palette.mode === 'dark' ? 0.4 : 1
                        ),
                    }}
                >
                    {children}
                </Box>
            ) : null}
        </Box>
    );
}

export const panelRowSx = {
    'py': 1.25,
    'borderBottom': (theme: Theme) => `1px solid ${theme.palette.divider}`,
    '&:last-of-type': { borderBottom: 0 },
};
