import { useState } from 'react';

import {
    Backdrop,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import { supabaseClient } from 'src/context/GlobalProviders';
import { zIndexIncrement } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { logRocketConsole } from 'src/services/shared';

const redirectToBase = `${window.location.origin}/auth`;

export function FullPageSSONotSatisfied() {
    const ssoNotSatisfied = useUserStore((state) => state.ssoNotSatisfied);
    const setSsoNotSatisfied = useUserStore(
        (state) => state.setSsoNotSatisfied
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSSOLogin = async () => {
        if (!ssoNotSatisfied) return;

        setLoading(true);
        setError(null);

        const { data, error: ssoError } =
            await supabaseClient.auth.signInWithSSO({
                domain: ssoNotSatisfied,
                options: {
                    redirectTo: redirectToBase,
                },
            });

        if (ssoError) {
            logRocketConsole('Auth:SSONotSatisfied redirect failed', ssoError);
            setError(ssoError.message);
            setLoading(false);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
        }
    };

    const handleCancel = () => {
        setSsoNotSatisfied(null);
    };

    return (
        <Backdrop
            sx={{
                zIndex: (theme) => theme.zIndex.tooltip + zIndexIncrement,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
            }}
            open={true}
        >
            <Paper
                sx={{
                    maxWidth: 460,
                    p: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                }}
            >
                <Stack spacing={3} alignItems="center">
                    <Typography variant="h5">SSO Login Required</Typography>

                    <Typography>
                        Your organization requires SSO. You will be redirected
                        to your organization&apos;s login page.
                    </Typography>

                    {error ? (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    ) : null}

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSSOLogin}
                            disabled={loading}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                ) : null
                            }
                        >
                            Continue to SSO Login
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Backdrop>
    );
}
