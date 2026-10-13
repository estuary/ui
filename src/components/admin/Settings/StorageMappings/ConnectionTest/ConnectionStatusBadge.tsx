import type { ReactNode } from 'react';
import type { StorageMappingConnection } from 'src/api/gql/storageMappings';

import { CircularProgress, Stack } from '@mui/material';

import { CheckCircle, WarningTriangle } from 'iconoir-react';

const STATUS_ICON_MAP: Record<StorageMappingConnection['status'], ReactNode> = {
    idle: null,
    testing: <CircularProgress size={20} color="inherit" />,
    success: <CheckCircle width={20} height={20} />,
    error: <WarningTriangle width={20} height={20} />,
};

const STATUS_COLOR_MAP: Record<StorageMappingConnection['status'], string> = {
    idle: 'text.secondary',
    testing: 'text.secondary',
    success: 'success.main',
    error: 'warning.main',
};

interface ConnectionStatusBadgeProps {
    status: StorageMappingConnection['status'];
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
    const icon = STATUS_ICON_MAP[status] ?? null;
    const color = STATUS_COLOR_MAP[status] ?? 'text.secondary';

    return icon ? (
        <Stack
            component="span"
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ color }}
        >
            {icon}
        </Stack>
    ) : null;
}
