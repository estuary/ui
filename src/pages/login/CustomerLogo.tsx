import { Box, Stack, useTheme } from '@mui/material';

import CoalesceDarkLogo from 'src/images/register/coalesce_dark.png';
import CoalesceLogo from 'src/images/register/coalesce.png';
import FlashDarkLogo from 'src/images/register/flash_dark.png';
import FlashLogo from 'src/images/register/flash.png';
import FlockDarkLogo from 'src/images/register/flock_dark.png';
import FlockLogo from 'src/images/register/flock.png';
import RevunitDarkLogo from 'src/images/register/revunit_dark.png';
import RevunitLogo from 'src/images/register/revunit.png';
import ShpDarkLogo from 'src/images/register/shp_dark.png';
import ShpLogo from 'src/images/register/shp.png';

const customers = [
    {
        logo: {
            light: CoalesceDarkLogo,
            dark: CoalesceLogo,
        },
    },
    {
        logo: {
            light: FlashDarkLogo,
            dark: FlashLogo,
        },
    },
    {
        logo: {
            light: ShpDarkLogo,
            dark: ShpLogo,
        },
    },

    {
        logo: {
            light: FlockDarkLogo,
            dark: FlockLogo,
        },
    },

    {
        logo: {
            light: RevunitDarkLogo,
            dark: RevunitLogo,
        },
    },
];

function CustomerLogo() {
    const theme = useTheme();

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'space-between' }}
        >
            {customers.map((customer, index) => {
                return (
                    <Box key={`customers_${index}`}>
                        <img
                            style={{ height: 30 }}
                            src={customer.logo[theme.palette.mode]}
                            alt="customer logo"
                        />
                    </Box>
                );
            })}
        </Stack>
    );
}

export default CustomerLogo;
