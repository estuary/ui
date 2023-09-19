import { Box, Typography } from '@mui/material';
import { ManualBill } from 'api/billing';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import { useIntl } from 'react-intl';

function ManualBillBanner({ bill }: { bill: ManualBill }) {
    const intl = useIntl();

    return (
        <CardWrapper>
            <Box display="flex">
                <Typography
                    sx={{ fontSize: 18, fontWeight: 400 }}
                    component="div"
                >
                    {bill.description}
                </Typography>
                <Typography
                    sx={{
                        flexGrow: 1,
                        fontSize: 16,
                        fontWeight: 300,
                        textAlign: 'center',
                    }}
                >
                    {bill.date_start} through {bill.date_end}
                </Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 300 }}>
                    {intl.formatNumber(bill.usd_cents / 100, {
                        style: 'currency',
                        currency: 'USD',
                    })}
                </Typography>
            </Box>
        </CardWrapper>
    );
}
export default ManualBillBanner;
