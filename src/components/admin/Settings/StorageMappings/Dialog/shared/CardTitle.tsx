import type { SxProps, Theme } from '@mui/material';

import { Stack, Typography } from '@mui/material';

import { ActionLink } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/ActionLink';
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
                <ActionLink onClick={onAction} disabled={actionDisabled}>
                    {action}
                </ActionLink>
            ) : null}
        </Stack>
    );
}
