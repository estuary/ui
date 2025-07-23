import { Box, Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import RegisterPerk from 'src/pages/login/Perk';

function RegisterMarketing() {
    return (
        <Stack spacing={4} sx={{ pr: 4 }}>
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

            <CardWrapper message="Estuary is a very productive product">
                "Estuary is a very productive product with a great pricing model
                given the current climate that we're in. I think a lot of cost
                conscious data practitioners could benefit from giving it a
                try."
                <Stack direction="row" spacing={1}>
                    <Box
                        sx={{
                            background: 'green',
                            width: '50px',
                            height: '50px',
                        }}
                    >
                        content
                    </Box>
                    <Stack>
                        <Typography>Shane Iseminger</Typography>

                        <Typography>CTO, SocialHP</Typography>
                    </Stack>
                </Stack>
            </CardWrapper>

            <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
            >
                <Box
                    sx={{
                        background: 'green',
                        width: '25px',
                        height: '25px',
                    }}
                >
                    logo
                </Box>

                <Box
                    sx={{
                        background: 'green',
                        width: '25px',
                        height: '25px',
                    }}
                >
                    logo
                </Box>

                <Box
                    sx={{
                        background: 'green',
                        width: '25px',
                        height: '25px',
                    }}
                >
                    logo
                </Box>

                <Box
                    sx={{
                        background: 'green',
                        width: '25px',
                        height: '25px',
                    }}
                >
                    logo
                </Box>

                <Box
                    sx={{
                        background: 'green',
                        width: '25px',
                        height: '25px',
                    }}
                >
                    logo
                </Box>
            </Stack>
        </Stack>
    );
}

export default RegisterMarketing;
