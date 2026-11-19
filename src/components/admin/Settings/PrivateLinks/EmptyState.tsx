import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
}

// The caller supplies the surrounding border.
export function EmptyState({
    icon,
    title,
    children,
    actions,
}: EmptyStateProps) {
    return (
        <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', textAlign: 'center', px: 2, py: 5 }}
        >
            <Box
                aria-hidden
                sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: (theme) => theme.spacing(6),
                    height: (theme) => theme.spacing(6),
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                }}
            >
                {icon}
            </Box>
            <Typography component="p" variant="subtitle1" fontWeight={600}>
                {title}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: '60ch' }}
            >
                {children}
            </Typography>
            {actions ? (
                <Stack
                    direction="row"
                    useFlexGap
                    spacing={1.5}
                    sx={{ flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}
                >
                    {actions}
                </Stack>
            ) : null}
        </Stack>
    );
}
