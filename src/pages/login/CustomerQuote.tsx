import { Box, Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import Customer from 'src/images/register/customer.jpeg';

const imgSize = 40;

function CustomerQuote() {
    return (
        <CardWrapper>
            <Typography
                sx={{
                    mb: 2,
                }}
            >
                {
                    '"Estuary transformed how we operationalize our data for fraud, security, support, and beyond. Instead of unreliable, expensive backfills, we have real-time visibility into platform activity. The proactive support and hands-on approach make all the difference."'
                }
            </Typography>
            <Stack direction="row" spacing={1} height={imgSize}>
                <Box>
                    <img
                        style={{ height: imgSize }}
                        src={Customer}
                        alt="Jonni Lundy"
                    />
                </Box>
                <Stack
                    sx={{
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography>Jonni Lundy</Typography>
                    <Typography>COO, Resend</Typography>
                </Stack>
            </Stack>
        </CardWrapper>
    );
}

export default CustomerQuote;
