import { useEffect, useRef } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { useMutation } from 'urql';

import { REDEEM_INVITE_LINK } from 'src/api/gql/inviteLinks';
import FullPageWrapper from 'src/app/FullPageWrapper';
import { authenticatedRoutes } from 'src/app/routes';
import MessageWithLink from 'src/components/content/MessageWithLink';
import FullPageSpinner from 'src/components/fullPage/Spinner';
import Error from 'src/components/shared/Error';
import { defaultOutline } from 'src/context/Theme';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { logRocketEvent } from 'src/services/shared';

interface Props {
    grantToken: string;
}

export function RedeemInviteLink({ grantToken }: Props) {
    const intl = useIntl();
    const navigate = useNavigate();

    const [{ error: redeemError, data: redeemData }, redeemInviteLink] =
        useMutation(REDEEM_INVITE_LINK);
    const mutate_userInfoSummary = useUserInfoSummaryStore(
        (state) => state.mutate
    );

    const redeemed = useRef(false);

    useEffect(() => {
        if (redeemed.current) return;
        redeemed.current = true;

        void (async () => {
            const result = await redeemInviteLink({ token: grantToken });

            if (result.data && mutate_userInfoSummary) {
                try {
                    await mutate_userInfoSummary();
                } catch (err) {
                    logRocketEvent('Invite:RefreshFailed', {
                        error: String(err),
                    });
                }
            }
        })();
    }, [grantToken, mutate_userInfoSummary, redeemInviteLink]);

    const grantResult = redeemData?.redeemInviteLink ?? null;

    const handleContinue = () => {
        void navigate(authenticatedRoutes.home.path, { replace: true });
    };

    if (redeemError) {
        return (
            <FullPageWrapper>
                <Stack spacing={2}>
                    <Typography variant="h5" align="center">
                        {intl.formatMessage({
                            id: 'tenant.grantDirective.error.header',
                        })}
                    </Typography>

                    <Error error={redeemError} condensed />

                    <MessageWithLink messageID="tenant.grantDirective.error.message.help" />
                </Stack>
            </FullPageWrapper>
        );
    }

    if (grantResult) {
        return (
            <FullPageWrapper>
                <Stack spacing={2}>
                    <Typography variant="h5" align="center">
                        {intl.formatMessage({
                            id: 'tenant.grantDirective.success.header',
                        })}
                    </Typography>

                    <Typography>
                        {intl.formatMessage(
                            { id: 'tenant.grantDirective.message' },
                            {
                                grantedCapability: (
                                    <b>{grantResult.capability}</b>
                                ),
                            }
                        )}
                    </Typography>

                    <Box
                        sx={{
                            p: 1,
                            border: (theme) =>
                                defaultOutline[theme.palette.mode],
                            borderRadius: 3,
                            overflow: 'auto',
                        }}
                    >
                        <Typography>{grantResult.catalogPrefix}</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleContinue}
                            sx={{ mt: 2 }}
                        >
                            {intl.formatMessage({
                                id: 'tenant.grantDirective.success.cta',
                            })}
                        </Button>
                    </Box>
                </Stack>
            </FullPageWrapper>
        );
    }

    return <FullPageSpinner />;
}
