import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { RefreshTokenTable } from 'src/components/admin/Api/RefreshToken/Table';

export function RefreshToken() {
    return (
        <Box sx={{ mb: 5 }}>
            <Stack sx={{ mx: 2, mb: 1 }}>
                <Typography
                    sx={{
                        mb: 0.5,
                        fontSize: 18,
                        fontWeight: '400',
                    }}
                >
<<<<<<< HEAD
                    <FormattedMessage id="admin.cli_api.refreshToken.header" />
=======
                    <FormattedMessage id="admin.cli_api.refreshToken" />
>>>>>>> 72f13fa7 (service accoutns)
                </Typography>

                <Typography>
                    <FormattedMessage id="admin.cli_api.refreshToken.message" />
                </Typography>
            </Stack>

            <RefreshTokenTable />
        </Box>
    );
}
