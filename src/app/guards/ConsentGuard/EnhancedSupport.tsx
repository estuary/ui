import {
    Box,
    FormControl,
    FormControlLabel,
    Stack,
    Switch,
} from '@mui/material';

import RegistrationProgress from 'src/app/guards/RegistrationProgress';
import Actions from 'src/directives/Actions';
import HeaderMessage from 'src/pages/login/HeaderMessage';

function EnhancedSupport() {
    return (
        <Stack
            spacing={3}
            sx={{
                mt: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'left',
            }}
        >
            <RegistrationProgress
                step={2}
                loading={false}
                status="unfulfilled"
            />

            <HeaderMessage isRegister />

            <form noValidate>
                <Stack
                    spacing={3}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        justifyContent: 'center',
                        mt: 5,
                    }}
                >
                    <FormControl>
                        <FormControlLabel
                            control={<Switch size="small" />}
                            label={<Box>Enhanced Support Disabled</Box>}
                        />
                    </FormControl>

                    <FormControl>
                        <FormControlLabel
                            control={<Switch size="small" />}
                            label={<Box>Session Recording Disabled</Box>}
                        />
                    </FormControl>

                    <Actions saving={false} primaryMessageId="cta.continue" />
                </Stack>
            </form>
        </Stack>
    );
}

export default EnhancedSupport;
