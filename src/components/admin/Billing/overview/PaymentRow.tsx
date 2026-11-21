import type { ReactNode } from 'react';

import { Stack, Typography } from '@mui/material';

import { captionSx } from 'src/components/admin/Billing/shared/CardHeader';

interface Props {
    caption: string;
    action?: ReactNode;
    children: ReactNode;
}

// One labeled line of the payment card, with its action at the end.
export function PaymentRow({ caption, action, children }: Props) {
    return (
        <Stack
            direction="row"
            sx={{
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: 2,
                rowGap: 1,
                px: 3,
                pt: 1.5,
                pb: 2,
            }}
        >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography sx={captionSx}>{caption}</Typography>
                {children}
            </Stack>

            {action}
        </Stack>
    );
}
