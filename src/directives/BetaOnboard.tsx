import { LoadingButton } from '@mui/lab';
import { Stack, TextField, Toolbar, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { jobStatusPoller } from 'services/supabase';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { jobStatusQuery, trackEvent } from './shared';
import { DirectiveProps } from './types';

const directiveName = 'betaOnboard';

const submit_onboard = async (requestedTenant: string, directive: any) => {
    return submitDirective(directiveName, directive, requestedTenant);
};

const BetaOnboard = ({ directive, mutate }: DirectiveProps) => {
    trackEvent(`${directiveName}:Viewed`);

    const intl = useIntl();
    const [requestedTenant, setRequestedTenant] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [nameMissing, setNameMissing] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);

            if (nameMissing) setNameMissing(!hasLength(updatedValue));
        },
        submit: async (event: any) => {
            event.preventDefault();

            if (!hasLength(requestedTenant)) {
                setNameMissing(true);
                setServerError(null);
            } else {
                setServerError(null);
                setNameMissing(false);
                setSaving(true);

                const clickToAcceptResponse = await submit_onboard(
                    requestedTenant,
                    directive
                );

                if (clickToAcceptResponse.error) {
                    return setServerError(
                        (clickToAcceptResponse.error as PostgrestError).message
                    );
                }

                const data = clickToAcceptResponse.data[0];
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
            }
        },
    };

    return (
        <>
            <Stack
                spacing={2}
                sx={{
                    mt: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'left',
                }}
            >
                <Typography variant="h5" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage id="tenant.heading" />
                </Typography>

                {nameMissing ? (
                    <AlertBox
                        short
                        severity="error"
                        title={<FormattedMessage id="error.title" />}
                    >
                        <FormattedMessage id="tenant.errorMessage.empty" />
                    </AlertBox>
                ) : null}

                {serverError ? (
                    <AlertBox
                        severity="error"
                        short
                        title={<FormattedMessage id="common.fail" />}
                    >
                        {serverError}
                    </AlertBox>
                ) : null}

                <Typography>
                    <FormattedMessage id="tenant.message.1" />
                </Typography>

                <Typography>
                    <FormattedMessage id="tenant.message.2" />
                </Typography>

                <Typography>
                    <FormattedMessage
                        id="tenant.docs.message"
                        values={{
                            link: (
                                <ExternalLink
                                    link={intl.formatMessage({
                                        id: 'tenant.docs.message.link',
                                    })}
                                >
                                    <FormattedMessage id="terms.documentation" />
                                </ExternalLink>
                            ),
                        }}
                    />
                </Typography>
            </Stack>

            <form noValidate onSubmit={handlers.submit}>
                <Stack
                    spacing={2}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder={intl.formatMessage({
                            id: 'tenant.input.placeholder',
                        })}
                        helperText={intl.formatMessage({
                            id: nameMissing
                                ? 'tenant.expectations.error'
                                : 'tenant.expectations',
                        })}
                        error={nameMissing}
                        id="requestedTenant"
                        label={<FormattedMessage id="common.tenant" />}
                        value={requestedTenant}
                        onChange={(event) =>
                            handlers.update(event.target.value)
                        }
                        required
                        inputProps={{
                            pattern: PREFIX_NAME_PATTERN,
                        }}
                    />

                    <Toolbar>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loading={saving}
                            disabled={saving}
                        >
                            <FormattedMessage id="cta.continue" />
                        </LoadingButton>
                    </Toolbar>
                </Stack>
            </form>
        </>
    );
};

export default BetaOnboard;
