import { Box, Stack, Typography } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useUserStore } from 'src/context/User/useUserContextStore';

function AccessToken() {
    const session = useUserStore((state) => state.session);

    return (
        <Box sx={{ p: 2 }} data-private>
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
                Access tokens are used to login to flowctl for the first time.
            </Typography>

            {/* TODO (defect): Display an error in the event the access token does not exist. */}
            <SingleLineCode value={session?.access_token ?? ''} />
        </Box>
    );
}

export default AccessToken;
