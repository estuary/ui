import type { Invoice } from 'src/api/billing';

import { Box, Divider, Typography } from '@mui/material';

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
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}
            >
                <Typography fontWeight="bold" sx={{ textWrap: 'nowrap' }}>
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
