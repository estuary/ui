import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CustomerLogos from 'src/pages/login/CustomerLogos';
import CustomerQuote from 'src/pages/login/CustomerQuote';
import RegisterPerk from 'src/pages/login/Perk';

function RegisterMarketing() {
    const intl = useIntl();

    return (
        <Stack spacing={4} style={{ alignItems: 'center' }}>
            <Typography
                component="h1"
                align="center"
                style={{ fontSize: 20, fontWeight: 300, width: 350 }}
                variant="h5"
            >
                {intl.formatMessage({ id: 'login.register.marketing.title' })}
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

            <CustomerLogos />
        </Stack>
    );
}

export default RegisterMarketing;
