import { Box, Stack, Typography } from '@mui/material';

import { useLeaf, withBranch } from 'react-semantic-tree';

import SingleLineCode from 'src/components/content/SingleLineCode';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useUserStore } from 'src/context/User/useUserContextStore';

function _AccessToken() {
    const { ref: tokenRef } = useLeaf('Copy Access Token');

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

                <ExternalLink
                    link="https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli"
                    label="Docs"
                />
            </Stack>

            <Typography sx={{ mb: 3 }}>
                Access tokens enable authentication using flowctl.
            </Typography>

            {/* TODO (defect): Display an error in the event the access token does not exist. */}
            <SingleLineCode
                ref={tokenRef}
                value={session?.access_token ?? ''}
            />
        </Box>
    );
}

export default withBranch('Access Token')(_AccessToken);
