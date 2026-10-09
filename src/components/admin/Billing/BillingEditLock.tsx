import { Box, Tooltip } from '@mui/material';

import { Lock } from 'iconoir-react';

interface BillingEditLockProps {
    tenant: string;
}

// Takes the place of an edit action for people with ViewBilling but not
// EditBilling on the tenant.
export function BillingEditLock({ tenant }: BillingEditLockProps) {
    const message = `You don't have permission to edit billing for ${tenant}`;

    return (
        // Tooltip labels its child with the message for screen readers.
        <Tooltip title={message}>
            <Box
                component="span"
                role="note"
                tabIndex={0}
                sx={{
                    display: 'inline-flex',
                    flex: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    color: 'text.secondary',
                }}
            >
                <Lock aria-hidden style={{ fontSize: 18 }} />
            </Box>
        </Tooltip>
    );
}
