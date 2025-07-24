import { Stack } from '@mui/material';

import RegisterPerk from 'src/pages/login/Perk';

function RegisterPerks() {
    return (
        <Stack
            useFlexGap
            direction={{ xs: 'column' }}
            style={{
                alignItems: 'center',
                justifyContent: 'space-around',
            }}
        >
            <RegisterPerk messageID="login.register.perks1" />
            <RegisterPerk messageID="login.register.perks2" />
        </Stack>
    );
}

export default RegisterPerks;
