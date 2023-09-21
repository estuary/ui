import { Box, Divider, Typography } from '@mui/material';
import { Invoice } from 'api/billing';
import { useIntl } from 'react-intl';

function TotalLines({ invoice }: { invoice: Invoice }) {
    const intl = useIntl();
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
                    justifyContent: 'space-between',
                }}
            >
                <Typography fontWeight="bold">Amount Due</Typography>
                <Typography fontWeight="bold">
                    {intl.formatNumber(invoice.subtotal / 100, {
                        style: 'currency',
                        currency: 'USD',
                    })}
                </Typography>
            </Box>
        </Box>
    );
}

export default TotalLines;
