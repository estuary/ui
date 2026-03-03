import type { SxProps, Theme } from '@mui/material';

import { Link, Stack, Typography } from '@mui/material';

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
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={sx}
        >
            <Typography sx={cardHeaderSx}>{title}</Typography>
            {action ? (
                <Link
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
                </Link>
            ) : null}
        </Stack>
    );
}
