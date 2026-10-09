import { Box, Stack, Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useUserStore } from 'src/context/User/useUserContextStore';

export function AccessToken() {
    const session = useUserStore((state) => state.session);

    return (
        <Box sx={{ py: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: '400',
                    }}
                >
                    Access Token
                </Typography>

                <ExternalLink link="https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli">
                    Docs
                </ExternalLink>
            </Stack>

            <Typography sx={{ mb: 3 }}>
                Access tokens enable authentication using flowctl.
            </Typography>

            <SingleLineCode value={session?.access_token ?? ''} />
        </Box>
    );
}
