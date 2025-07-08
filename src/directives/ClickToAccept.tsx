import type { PostgrestError } from '@supabase/postgrest-js';
import type { DirectiveProps, JobStatusQueryData } from 'src/directives/types';

import { useState } from 'react';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';

import { submitDirective } from 'src/api/directives';
import RegistrationProgress from 'src/app/guards/RegistrationProgress';
import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import Actions from 'src/directives/Actions';
import {
    CLICK_TO_ACCEPT_LATEST_VERSION,
    jobStatusQuery,
    trackEvent,
} from 'src/directives/shared';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import HeaderMessage from 'src/pages/login/HeaderMessage';
import { getUrls } from 'src/utils/env-utils';

const urls = getUrls();
const directiveName = 'clickToAccept';

const submit_clickToAccept = async (directive: any) => {
    return submitDirective(
        directiveName,
        directive,
        CLICK_TO_ACCEPT_LATEST_VERSION
    );
};

const ClickToAccept = ({ directive, status, mutate }: DirectiveProps) => {
    const intl = useIntl();
    const { jobStatusPoller } = useJobStatusPoller();

    const outdated = status === 'outdated';
    const waiting = status === 'waiting';

    const [acknowledgedDocuments, setAcknowledgedDocuments] =
        useState<boolean>(waiting);
    const [saving, setSaving] = useState(false);

    const [showErrors, setShowErrors] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const pollForDirective = (data: JobStatusQueryData) => {
        jobStatusPoller(
            jobStatusQuery(data),
            async () => {
                trackEvent(`${directiveName}:Complete`, directive);
                void mutate();
            },
            async (payload: any) => {
                trackEvent(`${directiveName}:Error`, directive);
                setSaving(false);
                setServerError(payload.job_status.error);
            }
        );
    };

    const handlers = {
        update: (_event: React.SyntheticEvent, checked: boolean) => {
            setAcknowledgedDocuments(checked);

            if (showErrors) setShowErrors(!checked);
        },
        submit: async (event: any) => {
            event.preventDefault();

            if (!acknowledgedDocuments) {
                setShowErrors(true);
            } else {
                setShowErrors(false);
                setSaving(true);

                const clickToAcceptResponse =
                    await submit_clickToAccept(directive);

                if (clickToAcceptResponse.error) {
                    setSaving(false);
                    return setServerError(
                        (clickToAcceptResponse.error as PostgrestError).message
                    );
                }

                const data = clickToAcceptResponse.data[0];
                pollForDirective(data);
            }
        },
    };

    useMount(() => {
        trackEvent(`${directiveName}:Viewed`);

        // The user may have reloaded while they are waiting on the directive
        //  to go through. If so - we can just keep them on the loading view
        if (directive && waiting) {
            trackEvent(`${directiveName}:AutoPolling`);
            setShowErrors(false);
            setSaving(true);
            pollForDirective({
                logs_token: directive.logs_token,
                directive_id: directive.directive_id,
                id: directive.id,
            });
        }
    });

    return (
        <>
            <Stack
                spacing={2}
                sx={{
                    mt: 1,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <RegistrationProgress
                    step={1}
                    loading={saving}
                    status={status}
                />

                <HeaderMessage
                    isRegister
                    headerMessageId={
                        !outdated ? 'legal.heading' : 'legal.heading.outdated'
                    }
                />

                {showErrors ? (
                    <AlertBox
                        short
                        severity="error"
                        title={intl.formatMessage({ id: 'error.title' })}
                    >
                        {intl.formatMessage({ id: 'legal.docs.errorMessage' })}
                    </AlertBox>
                ) : null}

                {serverError ? (
                    <AlertBox
                        severity="error"
                        short
                        title={intl.formatMessage({ id: 'common.fail' })}
                    >
                        {serverError}
                    </AlertBox>
                ) : null}

                <Typography>
                    <FormattedMessage
                        id={
                            !outdated
                                ? 'legal.message'
                                : 'legal.message.outdated'
                        }
                    />
                </Typography>

                <Stack spacing={1}>
                    <ExternalLink link={urls.privacyPolicy}>
                        {intl.formatMessage({ id: 'legal.docs.privacy' })}
                    </ExternalLink>

                    <ExternalLink link={urls.termsOfService}>
                        {intl.formatMessage({ id: 'legal.docs.terms' })}
                    </ExternalLink>
                </Stack>
            </Stack>

            <form
                noValidate
                onSubmit={handlers.submit}
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <FormControl error={showErrors} sx={{ mb: 3, mx: 0 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                disabled={waiting}
                                value={acknowledgedDocuments}
                                checked={acknowledgedDocuments}
                                required
                            />
                        }
                        onChange={handlers.update}
                        name="accept"
                        label={intl.formatMessage(
                            { id: 'legal.docs.accept' },
                            {
                                privacy: intl.formatMessage({
                                    id: 'legal.docs.privacy',
                                }),
                                terms: intl.formatMessage({
                                    id: 'legal.docs.terms',
                                }),
                            }
                        )}
                    />
                </FormControl>

                <Actions saving={saving} primaryMessageId="cta.continue" />
            </form>
        </>
    );
};

export default ClickToAccept;
