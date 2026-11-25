import type { ReactNode } from 'react';

import { Box } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';

interface Props {
    // Names the card's region for assistive technology.
    label: string;
    children: ReactNode;
}

// The billing cards run their rows edge to edge with hairline rules between
// them, so each section inside sets its own padding.
export function BillingCard({ label, children }: Props) {
    return (
        <Box component="section" aria-label={label}>
            <CardWrapper
                disableMinWidth
                sx={{ p: 0, rowGap: 0, overflow: 'hidden' }}
            >
                {children}
            </CardWrapper>
        </Box>
    );
}
