import type { PrivateLinkProvisioningStatus } from 'src/gql-types/graphql';

import { Box, CircularProgress, Typography } from '@mui/material';

const INDICATOR_SIZE = 12;

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
        <Box
            component="span"
            sx={{
                display: 'inline-grid',
                gridTemplateColumns: `${INDICATOR_SIZE}px auto`,
                columnGap: 0.75,
                alignItems: 'center',
                color,
            }}
        >
            {status === 'PENDING' ? (
                <CircularProgress
                    size={INDICATOR_SIZE}
                    color="inherit"
                    aria-hidden
                />
            ) : (
                <Box
                    component="span"
                    aria-hidden
                    sx={{
                        justifySelf: 'center',
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
        </Box>
    );
}
