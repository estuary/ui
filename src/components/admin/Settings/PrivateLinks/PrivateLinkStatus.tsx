import type { PrivateLinkProvisioningStatus } from 'src/gql-types/graphql';

import { Chip, CircularProgress } from '@mui/material';

const statuses = {
    PENDING: { label: 'Pending', color: 'warning' },
    PROVISIONED: { label: 'Provisioned', color: 'success' },
    FAILED: { label: 'Failed', color: 'error' },
} as const;

export function PrivateLinkStatus({
    status,
}: {
    status: PrivateLinkProvisioningStatus;
}) {
    const { label, color } = statuses[status];

    return (
        <Chip
            size="small"
            variant="outlined"
            color={color}
            label={label}
            icon={
                status === 'PENDING' ? (
                    <CircularProgress size={12} color="inherit" aria-hidden />
                ) : undefined
            }
        />
    );
}
