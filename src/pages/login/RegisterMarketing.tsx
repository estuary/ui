import { Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import RegisterPerk from 'src/pages/login/Perk';

function RegisterMarketing() {
    return (
        <>
            <Typography component="h1" align="center" variant="h5">
                Estuary flow is a real-time data platform built for the cloud
            </Typography>

            <Stack
                useFlexGap
                direction={{ xs: 'column' }}
                style={{
                    alignItems: 'start',
                    justifyContent: 'space-around',
                }}
            >
                <RegisterPerk disableNoWrap messageID="login.register.perks3" />
                <RegisterPerk disableNoWrap messageID="login.register.perks4" />
                <RegisterPerk disableNoWrap messageID="login.register.perks5" />
            </Stack>

            <CardWrapper message="Estuary is a very productive product">
                "Quote content here and there"
            </CardWrapper>
        </>
    );
}

export default RegisterMarketing;
