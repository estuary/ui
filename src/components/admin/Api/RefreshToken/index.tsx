import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import RefreshTokenTable from 'src/components/tables/RefreshTokens';

function RefreshToken() {
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
                    <FormattedMessage id="admin.cli_api.refreshToken" />
                </Typography>

                <Typography>
                    <FormattedMessage id="admin.cli_api.refreshToken.message" />
                </Typography>
            </Stack>

            <RefreshTokenTable />
        </Box>
    );
}

export default RefreshToken;
