import { Box, Divider, Typography } from '@mui/material';
import { BillingRecord } from 'api/billing';
import { useIntl } from 'react-intl';

function TotalLines({ bill }: { bill: BillingRecord }) {
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
                    {intl.formatNumber(bill.subtotal / 100, {
                        style: 'currency',
                        currency: 'USD',
                    })}
                </Typography>
            </Box>
        </Box>
    );
}

export default TotalLines;
