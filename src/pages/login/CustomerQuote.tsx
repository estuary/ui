import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import Customer from 'src/images/register/customer.jpeg';

const imgSize = 40;

function CustomerQuote() {
    const intl = useIntl();

    return (
        <CardWrapper>
            <Typography
                sx={{
                    mb: 2,
                }}
            >
                {intl.formatMessage({ id: 'login.register.quote.body' })}
            </Typography>
            <Stack direction="row" spacing={1} height={imgSize}>
                <Box>
                    <img
                        style={{ height: imgSize }}
                        src={Customer}
                        alt={intl.formatMessage({
                            id: 'login.register.quote.name',
                        })}
                    />
                </Box>
                <Stack
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography>
                        {intl.formatMessage({
                            id: 'login.register.quote.name',
                        })}
                    </Typography>
                    <Typography>
                        {intl.formatMessage({
                            id: 'login.register.quote.employment',
                        })}
                    </Typography>
                </Stack>
            </Stack>
        </CardWrapper>
    );
}

export default CustomerQuote;
