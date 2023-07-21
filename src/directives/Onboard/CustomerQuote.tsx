import { useIntl } from 'react-intl';

import { Box, useTheme } from '@mui/material';

import customerQuoteDark from 'images/customer_quote-dark.png';
import customerQuoteLight from 'images/customer_quote-light.png';

interface Props {
    hideQuote: boolean;
}
function CustomerQuote({ hideQuote }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    if (hideQuote) {
        return null;
    } else {
        return (
            <Box
                sx={{
                    width: '50%',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img
                    src={
                        theme.palette.mode === 'light'
                            ? customerQuoteLight
                            : customerQuoteDark
                    }
                    width="85%"
                    alt={intl.formatMessage({ id: 'company' })}
                />
            </Box>
        );
    }
}

export default CustomerQuote;
