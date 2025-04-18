import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import SingleLineCode from 'src/components/content/SingleLineCode';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useUserStore } from 'src/context/User/useUserContextStore';

function AccessToken() {
    const session = useUserStore((state) => state.session);

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: '400',
                    }}
                >
                    <FormattedMessage id="admin.cli_api.accessToken" />
                </Typography>

                <ExternalLink link="https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli">
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
            </Stack>

            <Typography sx={{ mb: 3 }}>
                <FormattedMessage id="admin.cli_api.accessToken.message" />
            </Typography>

            {/* TODO (defect): Display an error in the event the access token does not exist. */}
            <SingleLineCode value={session?.access_token ?? ''} />
        </Box>
    );
}

export default AccessToken;
