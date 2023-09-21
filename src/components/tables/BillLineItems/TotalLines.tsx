import { Box, Divider, Typography } from '@mui/material';
import { Invoice } from 'api/billing';
import { FormattedMessage, useIntl } from 'react-intl';

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
                <Typography fontWeight="bold">
                    <FormattedMessage id="admin.billing.table.line_items.label.total" />
                </Typography>
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
