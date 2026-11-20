import type { PrivateLinkProvisioningStatus } from 'src/gql-types/graphql';

import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export const privateLinkStatuses = {
    PENDING: { label: 'Setting up', color: 'warning.main' },
    PROVISIONED: { label: 'Provisioned', color: 'success.main' },
    FAILED: { label: 'Failed', color: 'error.main' },
} as const;

export function PrivateLinkStatus({
    status,
}: {
    status: PrivateLinkProvisioningStatus;
}) {
    const { label, color } = privateLinkStatuses[status];

    return (
        <Stack
            component="span"
            direction="row"
            spacing={0.75}
            sx={{ display: 'inline-flex', alignItems: 'center', color }}
        >
            {status === 'PENDING' ? (
                <CircularProgress size={12} color="inherit" aria-hidden />
            ) : (
                <Box
                    component="span"
                    aria-hidden
                    sx={{
                        width: 6,
                        height: 6,
                        bgcolor: 'currentColor',
                        borderRadius: '50%',
                    }}
                />
            )}
            <Typography component="span" variant="caption">
                {label}
            </Typography>
        </Stack>
    );
}
