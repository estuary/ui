import type { Invoice } from 'src/api/billing';

import { Box, Divider, Typography } from '@mui/material';

function TotalLines({ invoice }: { invoice: Invoice }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '30%',
            }}
        >
            <Divider sx={{ flex: 1, marginBottom: 1 }} />
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}
            >
                <Typography fontWeight="bold" sx={{ textWrap: 'nowrap' }}>
                    Total Due
                </Typography>
                <Typography fontWeight="bold">
                    {(invoice.subtotal / 100).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    })}
                </Typography>
            </Box>
        </Box>
    );
}

export default TotalLines;
