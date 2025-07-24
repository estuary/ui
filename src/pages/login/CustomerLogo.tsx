import { Box, Stack } from '@mui/material';

import CoalesceLogo from 'src/images/register/coalesce.png';
import FlashLogo from 'src/images/register/flash.png';
import FlockLogo from 'src/images/register/flock.png';
import RevunitLogo from 'src/images/register/revunit.png';
import ShpLogo from 'src/images/register/shp.png';

const customers = [
    {
        logo: CoalesceLogo,
    },
    {
        logo: FlashLogo,
    },
    {
        logo: ShpLogo,
    },
    {
        logo: FlockLogo,
    },
    {
        logo: RevunitLogo,
    },
];

function CustomerLogo() {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
        >
            {customers.map(({ logo }, index) => {
                return (
                    <Box key={`customers_${index}`}>
                        <img
                            style={{ height: 35 }}
                            src={logo}
                            alt="customer logo"
                        />
                    </Box>
                );
            })}
        </Stack>
    );
}

export default CustomerLogo;
