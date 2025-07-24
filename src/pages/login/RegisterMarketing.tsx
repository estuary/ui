import { Stack, Typography } from '@mui/material';

import CustomerLogo from 'src/pages/login/CustomerLogo';
import CustomerQuote from 'src/pages/login/CustomerQuote';
import RegisterPerk from 'src/pages/login/Perk';

function RegisterMarketing() {
    return (
        <Stack spacing={4}>
            <Typography component="h1" align="center" variant="h5">
                Estuary flow is a real-time data platform built for the cloud
            </Typography>

            <Stack
                useFlexGap
                direction={{ xs: 'column' }}
                spacing={2}
                style={{
                    alignItems: 'start',
                }}
            >
                <RegisterPerk
                    disableNoWrap
                    disableEmphasisColor
                    messageID="login.register.perks3"
                />
                <RegisterPerk
                    disableNoWrap
                    disableEmphasisColor
                    messageID="login.register.perks4"
                />
                <RegisterPerk
                    disableNoWrap
                    disableEmphasisColor
                    messageID="login.register.perks5"
                />
            </Stack>

            <CustomerQuote />

            <CustomerLogo />
        </Stack>
    );
}

export default RegisterMarketing;
