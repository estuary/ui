import { Box, Stack, Typography } from '@mui/material';

import { useSemanticLeaf } from 'react-semantic-tree';

import SingleLineCode from 'src/components/content/SingleLineCode';
import ExternalLink from 'src/components/shared/ExternalLink';
import { useUserStore } from 'src/context/User/useUserContextStore';

function AccessToken() {
    const { ref: semanticAuthenticationDocumentationRef } =
        useSemanticLeaf<HTMLAnchorElement>('Authentication Documentation');
    const { ref: semanticCopyAccessTokenRef } =
        useSemanticLeaf<HTMLButtonElement>('Copy Access Token');

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
                    linkRef={semanticAuthenticationDocumentationRef}
                    link="https://docs.estuary.dev/reference/authentication/#authenticating-flow-using-the-cli"
                >
                    Docs
                </ExternalLink>
            </Stack>

            <Typography sx={{ mb: 3 }}>
                Access tokens enable authentication using flowctl.
            </Typography>

            {/* TODO (defect): Display an error in the event the access token does not exist. */}
            <SingleLineCode
                copyButtonRef={semanticCopyAccessTokenRef}
                value={session?.access_token ?? ''}
            />
        </Box>
    );
}

export default AccessToken;
