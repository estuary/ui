import { Box, Stack, Typography } from '@mui/material';

import { withBranch } from 'react-semantic-tree';

import { RefreshTokenTable } from 'src/components/admin/Api/RefreshToken/Table';

function _RefreshToken() {
    return (
        <Box sx={{ mb: 5 }}>
            <Stack sx={{ mb: 1 }}>
                <Typography
                    sx={{
                        mb: 0.5,
                        fontSize: 18,
                        fontWeight: '400',
                    }}
                >
                    Refresh Tokens
                </Typography>

                <Typography>
                    Refresh tokens enable programmatic access to most services
                    including the Kafka compatible API &quot;dekaf&quot;.
                </Typography>
            </Stack>

            <RefreshTokenTable />
        </Box>
    );
}

export const RefreshToken = withBranch('Refresh Tokens')(_RefreshToken);
