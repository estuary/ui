import type { RedeemInviteLinkResult } from 'src/gql-types/graphql';

import { useEffect, useRef, useState } from 'react';

import { Box, LinearProgress, Stack, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import { useRedeemInviteLink } from 'src/api/gql/inviteLinks';
import FullPageWrapper from 'src/app/FullPageWrapper';
import { authenticatedRoutes } from 'src/app/routes';
import MessageWithLink from 'src/components/content/MessageWithLink';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
import AlertBox from 'src/components/shared/AlertBox';
import { defaultOutline } from 'src/context/Theme';
import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';

interface Props {
    grantToken: string;
}

export function RedeemInviteLink({ grantToken }: Props) {
    const intl = useIntl();
    const navigate = useNavigate();

    const [, redeemInviteLink] = useRedeemInviteLink();
    const mutate_userInfoSummary = useUserInfoSummaryStore(
        (state) => state.mutate
    );

    const [serverError, setServerError] = useState<string | null>(null);
    const [grantResult, setGrantResult] =
        useState<RedeemInviteLinkResult | null>(null);

    const redeemed = useRef(false);

    useEffect(() => {
        if (redeemed.current) return;
        redeemed.current = true;

        void (async () => {
            const result = await redeemInviteLink({ token: grantToken });

            if (result.error) {
                setServerError(
                    result.error.graphQLErrors[0]?.message ??
                        result.error.message ??
                        intl.formatMessage({
                            id: 'tenant.grantDirective.error.message',
                        })
                );
            } else if (result.data) {
                if (mutate_userInfoSummary) {
                    try {
                        await mutate_userInfoSummary();
                    } catch {
                        // Best-effort refresh; the grant still succeeded
                    }
                }

                setGrantResult(result.data.redeemInviteLink);
            }
        })();
    }, [grantToken, intl, mutate_userInfoSummary, redeemInviteLink]);

    const handleContinue = () => {
        void navigate(authenticatedRoutes.home.path, { replace: true });
    };

    if (serverError) {
        return (
            <FullPageWrapper>
                <Stack spacing={2}>
                    <Typography variant="h5" align="center">
                        <FormattedMessage id="tenant.grantDirective.error.header" />
                    </Typography>

                    <AlertBox
                        severity="error"
                        short
                        title={<FormattedMessage id="common.fail" />}
                    >
                        {serverError}
                    </AlertBox>

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
                        <FormattedMessage id="tenant.grantDirective.success.header" />
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
                        <SafeLoadingButton
                            variant="contained"
                            onClick={handleContinue}
                            sx={{ mt: 2 }}
                        >
                            {intl.formatMessage({ id: 'cta.continue' })}
                        </SafeLoadingButton>
                    </Box>
                </Stack>
            </FullPageWrapper>
        );
    }

    return (
        <FullPageWrapper>
            <LinearProgress variant="indeterminate" />
        </FullPageWrapper>
    );
}
