import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import {
    PostgrestError,
    PostgrestSingleResponse,
} from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import SafeLoadingButton from 'components/SafeLoadingButton';
import AlertBox from 'components/shared/AlertBox';
import { defaultOutline } from 'context/Theme';
import { useUserInfoSummaryStore } from 'context/UserInfoSummary/useUserInfoSummaryStore';
import { jobStatusQuery, trackEvent } from 'directives/shared';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';

interface Props {
    directive: AppliedDirective<any> | null | undefined;
    mutate: KeyedMutator<
        PostgrestSingleResponse<JoinedAppliedDirective[]>
    > | null;
    grantedPrefix: string;
    grantedCapability: string;
}

const directiveName = 'grant';

function AcceptGrant({
    directive,
    mutate,
    grantedPrefix,
    grantedCapability,
}: Props) {
    const { jobStatusPoller } = useJobStatusPoller();
    const mutate_userInfoSummary = useUserInfoSummaryStore(
        (state) => state.mutate
    );

    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const applyDirective = async (): Promise<void> => {
        setSaving(true);

        if (directive && grantedPrefix) {
            const response = await submitDirective(
                directiveName,
                directive,
                grantedPrefix
            );

            if (response.error) {
                setSaving(false);

                return setServerError(
                    (response.error as PostgrestError).message
                );
            }

            const data = response.data[0];

            jobStatusPoller(
                jobStatusQuery(data),
                async () => {
                    trackEvent(`${directiveName}:Complete`, directive);

                    if (mutate_userInfoSummary) {
                        mutate_userInfoSummary()
                            .then(() => {
                                trackEvent(
                                    `${directiveName}:UserInfoSummary:Mutate:Success`
                                );
                            })
                            .catch(() => {
                                trackEvent(
                                    `${directiveName}:UserInfoSummary:Mutate:Error`
                                );
                            });
                    }

                    if (mutate) {
                        mutate()
                            .then(() => {
                                trackEvent(
                                    `${directiveName}:Complete:Mutate:Success`
                                );
                            })
                            .catch(() => {
                                trackEvent(
                                    `${directiveName}:Complete:Mutate:Error`
                                );
                            });
                    }
                },
                async (payload: any) => {
                    trackEvent(`${directiveName}:Error`, directive);

                    setSaving(false);
                    setServerError(payload.job_status.error);
                }
            );
        }
    };

    // TODO (RegistrationProgress) get this wired up to know what step it is and use the RegistrationProgress component
    return (
        <Stack spacing={2}>
            {saving ? <LinearProgress variant="indeterminate" /> : null}

            {serverError ? (
                <AlertBox
                    severity="error"
                    short
                    title={<FormattedMessage id="common.fail" />}
                >
                    {serverError}
                </AlertBox>
            ) : null}

            <Typography variant="h5" align="center">
                <FormattedMessage id="tenant.grantDirective.header" />
            </Typography>

            <Typography>
                <FormattedMessage
                    id="tenant.grantDirective.message"
                    values={{ grantedCapability: <b>{grantedCapability}</b> }}
                />
            </Typography>

            <Box
                sx={{
                    p: 1,
                    border: (theme) => defaultOutline[theme.palette.mode],
                    borderRadius: 3,
                }}
            >
                <Typography>{grantedPrefix}</Typography>
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
                    loading={saving}
                    disabled={saving}
                    onClick={applyDirective}
                    sx={{ mt: 2 }}
                >
                    <FormattedMessage id="cta.continue" />
                </SafeLoadingButton>
            </Box>
        </Stack>
    );
}

export default AcceptGrant;
