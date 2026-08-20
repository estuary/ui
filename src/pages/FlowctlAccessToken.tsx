import { Box, Stack, Typography } from '@mui/material';

import { authenticatedRoutes } from 'src/app/routes';
import AlertBox from 'src/components/shared/AlertBox';
import { CopyValueButton } from 'src/components/shared/buttons/CopyValueButton';
import { useUserStore } from 'src/context/User/useUserContextStore';
import usePageTitle from 'src/hooks/usePageTitle';

function FlowctlAccessToken() {
    const accessToken = useUserStore((state) => state.session?.access_token);

    usePageTitle({
        header: authenticatedRoutes.flowctl.accessToken.title,
    });

    return (
        <Box sx={{ maxWidth: 680, py: 2 }} data-private>
            <Stack spacing={2}>
                {accessToken ? (
                    <Stack spacing={2}>
                        <CopyValueButton
                            value={accessToken}
                            source="FlowctlAccessToken"
                            label="Copy access token"
                            sx={{ alignSelf: 'flex-start' }}
                        />
                        <Typography>
                            Paste this token into your terminal to complete
                            flowctl login.
                        </Typography>
                    </Stack>
                ) : (
                    <AlertBox severity="warning" short>
                        No access token is available. Refresh the page or log in
                        again, then retry flowctl login.
                    </AlertBox>
                )}
            </Stack>
        </Box>
    );
}

export default FlowctlAccessToken;
