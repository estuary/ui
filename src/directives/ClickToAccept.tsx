import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import RegistrationProgress from 'app/guards/RegistrationProgress';
import SafeLoadingButton from 'components/SafeLoadingButton';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { supabaseClient } from 'context/GlobalProviders';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import HeaderMessage from 'pages/login/HeaderMessage';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount } from 'react-use';
import { getUrls } from 'utils/env-utils';
import {
    CLICK_TO_ACCEPT_LATEST_VERSION,
    jobStatusQuery,
    trackEvent,
} from './shared';
import { DirectiveProps } from './types';

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

    const [acknowledgedDocuments, setAcknowledgedDocuments] =
        useState<boolean>(false);
    const [saving, setSaving] = useState(false);

    const [showErrors, setShowErrors] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const outdated = status === 'outdated';

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

                const clickToAcceptResponse = await submit_clickToAccept(
                    directive
                );

                if (clickToAcceptResponse.error) {
                    setSaving(false);
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

    useMount(() => {
        trackEvent(`${directiveName}:Viewed`);
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
                <RegistrationProgress step={1} loading={saving} />

                <HeaderMessage
                    isRegister
                    smallLogo
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
                            <Checkbox value={acknowledgedDocuments} required />
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

                <Toolbar
                    disableGutters
                    sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Button
                        disabled={saving}
                        variant="outlined"
                        onClick={async () => {
                            await supabaseClient.auth.signOut();
                        }}
                    >
                        {intl.formatMessage({ id: 'cta.cancel' })}
                    </Button>
                    <SafeLoadingButton
                        type="submit"
                        variant="contained"
                        loading={saving}
                        disabled={saving}
                    >
                        {intl.formatMessage({ id: 'cta.continue' })}
                    </SafeLoadingButton>
                </Toolbar>
            </form>
        </>
    );
};

export default ClickToAccept;
