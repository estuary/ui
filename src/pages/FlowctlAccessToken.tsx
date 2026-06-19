import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { CheckCircle, Copy } from 'iconoir-react';

import { authenticatedRoutes } from 'src/app/routes';
import AlertBox from 'src/components/shared/AlertBox';
import { useUserStore } from 'src/context/User/useUserContextStore';
import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';

function FlowctlAccessToken() {
    const accessToken = useUserStore((state) => state.session?.access_token);
    const [isCopied, setIsCopied] = useState(false);

    usePageTitle({
        header: authenticatedRoutes.flowctl.accessToken.title,
    });

    const handleCopy = () => {
        if (!accessToken) {
            return;
        }

        navigator.clipboard.writeText(accessToken).then(
            () => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 3000);
            },
            () => {
                setIsCopied(false);
                logRocketEvent('Error_Silent', {
                    component: 'FlowctlAccessToken',
                    operation: 'copyAccessToken',
                });
            }
        );
    };

    return (
        <Box sx={{ maxWidth: 680, p: 2 }} data-private>
            <Stack spacing={2}>
                <Typography variant="h6" component="h1">
                    Flowctl access token
                </Typography>

                {accessToken ? (
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={
                                isCopied ? (
                                    <CheckCircle width={20} height={20} />
                                ) : (
                                    <Copy width={20} height={20} />
                                )
                            }
                            color={isCopied ? 'success' : 'primary'}
                            onClick={handleCopy}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            {isCopied ? 'Copied' : 'Copy access token'}
                        </Button>
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
