import { LoadingButton } from '@mui/lab';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import { submitDirective } from 'api/directives';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { jobStatusPoller } from 'services/supabase';
import { getUrls } from 'utils/env-utils';
import { jobStatusQuery } from './shared';

const urls = getUrls();

export const CLICK_TO_ACCEPT_LATEST_VERSION = 'v1';

const submit_clickToAccept = async () => {
    return submitDirective('clickToAccept', CLICK_TO_ACCEPT_LATEST_VERSION);
};

const ClickToAccept = () => {
    console.log('Guard:Form:ClickToAccept');

    const navigate = useNavigate();

    const [acknowledgedDocuments, setAcknowledgedDocuments] =
        useState<boolean>(false);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

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

                const clickToAcceptResponse = await submit_clickToAccept();

                if (clickToAcceptResponse.error) {
                    return console.log(clickToAcceptResponse.error);
                }

                const data = clickToAcceptResponse.data[0];
                jobStatusPoller(
                    jobStatusQuery(data),
                    async () => {
                        navigate(0);
                    },
                    async (payload: any) => {
                        console.log('failed', payload);
                        setSaving(false);
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
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h6" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage id="legal.heading" />
                </Typography>

                <FormattedMessage id="legal.message" />

                <Stack spacing={1}>
                    <ExternalLink link={urls.privacyPolicy}>
                        <FormattedMessage id="legal.docs.privacy" />
                    </ExternalLink>

                    <ExternalLink link={urls.termsOfService}>
                        <FormattedMessage id="legal.docs.terms" />
                    </ExternalLink>
                </Stack>

                {showErrors ? (
                    <AlertBox
                        short
                        severity="error"
                        title={<FormattedMessage id="error.title" />}
                    >
                        <FormattedMessage id="legal.docs.errorMessage" />
                    </AlertBox>
                ) : null}
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
                        label={
                            <FormattedMessage
                                id="legal.docs.accept"
                                values={{
                                    privacy: (
                                        <FormattedMessage id="legal.docs.privacy" />
                                    ),
                                    terms: (
                                        <FormattedMessage id="legal.docs.terms" />
                                    ),
                                }}
                            />
                        }
                    />
                </FormControl>

                <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={saving}
                    disabled={saving}
                >
                    <FormattedMessage id="cta.continue" />
                </LoadingButton>
            </form>
        </>
    );
};

export default ClickToAccept;
