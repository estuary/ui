import { Box, Stack, Typography } from '@mui/material';

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
                    Personal Tokens
                </Typography>

                <Typography>
                    Personal tokens enable programmatic access to most services
                    including the Kafka compatible API “dekaf”.
                </Typography>
            </Stack>

            <RefreshTokenTable />
        </Box>
    );
}
