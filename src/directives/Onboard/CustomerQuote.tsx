import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import customerQuoteDark from 'images/customer_quote-dark.png';
import customerQuoteLight from 'images/customer_quote-light.png';

function CustomerQuote() {
    const theme = useTheme();
    const intl = useIntl();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    if (belowMd) {
        return null;
    } else {
        return (
            // TODO (customer quote) should switch this to HTML to load faster
            // <Stack
            //     sx={{
            //         alignItems: 'flex-start',

            //         px: 3,
            //     }}
            // >
            //     <Typography
            //         color="primary"
            //         sx={{
            //             transform: 'rotate(180deg)',
            //         }}
            //     >
            //         <QuoteSolid style={{ fontSize: 50 }} />
            //     </Typography>
            //     <Typography
            //         variant="body2"
            //         sx={{
            //             color: '#777b82',
            //             fontSize: 28,
            //             mt: 1,
            //             pl: 1.5,
            //         }}
            //     >
            //         {`"${intl.formatMessage({
            //             id: 'tenant.customer.quote',
            //         })}"`}
            //     </Typography>
            //     <Box
            //         sx={{
            //             mt: 3,
            //         }}
            //     >
            //         <img
            //             src={customerLogo}
            //             height="36px"
            //             width="100px"
            //             alt={intl.formatMessage({ id: 'company' })}
            //         />
            //     </Box>
            // </Stack>
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'center',
                    width: '100%',
                }}
            >
                <img
                    src={
                        theme.palette.mode === 'light'
                            ? customerQuoteLight
                            : customerQuoteDark
                    }
                    width="85%"
                    alt={intl.formatMessage({ id: 'tenant.customer.quote' })}
                />
            </Box>
        );
    }
}

export default CustomerQuote;
