import { Box, Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import Customer from 'src/images/register/customer.png';

function CustomerQuote() {
    return (
        <CardWrapper message="Estuary is a very productive product">
            “Estuary is a very productive product with a great pricing model
            given the current climate that we're in. I think a lot of
            cost-conscious data practitioners could benefit from giving it a
            try.”
            <Stack direction="row" spacing={1}>
                <Box
                    sx={{
                        background: 'green',
                        width: '50px',
                        height: '50px',
                    }}
                >
                    <img
                        style={{ height: 50 }}
                        src={Customer}
                        alt="Shane Iseminger portrait"
                    />
                </Box>
                <Stack>
                    <Typography>Shane Iseminger</Typography>

                    <Typography>CTO, SocialHP</Typography>
                </Stack>
            </Stack>
        </CardWrapper>
    );
}

export default CustomerQuote;
