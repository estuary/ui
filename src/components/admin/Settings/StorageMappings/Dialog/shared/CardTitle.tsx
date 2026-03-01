import type { SxProps, Theme } from '@mui/material';

import { Box, Link, Typography } from '@mui/material';

import { cardHeaderSx } from 'src/context/Theme';

interface CardTitleProps {
    title: string;
    action?: string;
    onAction?: () => void;
    actionDisabled?: boolean;
    sx?: SxProps<Theme>;
}

export function CardTitle({
    title,
    action,
    onAction,
    actionDisabled,
    sx,
}: CardTitleProps) {
    return (
        <Box
            sx={[
                {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Typography sx={cardHeaderSx}>{title}</Typography>
            {action ? <Link
                    component="button"
                    variant="body2"
                    underline="hover"
                    disabled={actionDisabled}
                    onClick={onAction}
                    sx={{
                        opacity: actionDisabled ? 0.5 : 1,
                        pointerEvents: actionDisabled ? 'none' : 'auto',
                    }}
                >
                    {action}
                </Link> : null}
        </Box>
    );
}
