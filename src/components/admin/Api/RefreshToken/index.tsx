import { Box, Link, Stack, Typography } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { RefreshTokenTable } from 'src/components/admin/Api/RefreshToken/Table';
import AlertBox from 'src/components/shared/AlertBox';

export function RefreshToken() {
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
                    Personal Tokens
                </Typography>

                <Typography>
                    Personal tokens enable programmatic access to most services
                    including the Kafka compatible API “dekaf”.
                </Typography>
            </Stack>

            <Box sx={{ maxWidth: 660, mb: 3 }}>
                <AlertBox severity="info" short>
                    <Typography>
                        A personal token acts as you. It carries your own
                        access, and it stops working when your account loses
                        that access. For automation that a team depends on, such
                        as CI/CD pipelines, AI agents, and shared integrations,
                        create a{' '}
                        <Link
                            component={RouterLink}
                            to={
                                authenticatedRoutes.admin.serviceAccounts
                                    .fullPath
                            }
                        >
                            service account
                        </Link>{' '}
                        instead. A service account is a separate identity with
                        its own access grants.
                    </Typography>
                </AlertBox>
            </Box>

            <RefreshTokenTable />
        </Box>
    );
}
