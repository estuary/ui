import { useState } from 'react';

import { KeyedMutator } from 'swr';
import { AppliedDirective, JoinedAppliedDirective } from 'types';
import { FormattedMessage } from 'react-intl';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';

import { submitDirective } from 'api/directives';

import AlertBox from 'components/shared/AlertBox';

import { defaultOutline } from 'context/Theme';

import { jobStatusQuery, trackEvent } from 'directives/shared';

import { SuccessResponse } from 'hooks/supabase-swr';

import { jobStatusPoller } from 'services/supabase';

interface Props {
    directive: AppliedDirective<any> | null;
    mutate: KeyedMutator<SuccessResponse<JoinedAppliedDirective>> | null;
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

                    if (mutate) {
                        void mutate();
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

    return (
        <Stack spacing={2}>
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
                <LoadingButton
                    variant="contained"
                    loading={saving}
                    disabled={saving}
                    onClick={applyDirective}
                    sx={{ mt: 2 }}
                >
                    <FormattedMessage id="cta.continue" />
                </LoadingButton>
            </Box>
        </Stack>
    );
}

export default AcceptGrant;
