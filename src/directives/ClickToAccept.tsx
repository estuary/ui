import { useState } from 'react';

import { Square } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { LoadingButton } from '@mui/lab';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    Stack,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';

import { submitDirective } from 'api/directives';

import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';

import CheckSquare from 'icons/CheckSquare';

import { jobStatusPoller } from 'services/supabase';

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
    trackEvent(`${directiveName}:Viewed`);

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
                <Typography variant="h5" align="center" sx={{ mb: 1.5 }}>
                    <FormattedMessage
                        id={
                            !outdated
                                ? 'legal.heading'
                                : 'legal.heading.outdated'
                        }
                    />
                </Typography>

                {showErrors ? (
                    <AlertBox
                        short
                        severity="error"
                        title={<FormattedMessage id="error.title" />}
                    >
                        <FormattedMessage id="legal.docs.errorMessage" />
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
                        <FormattedMessage id="legal.docs.privacy" />
                    </ExternalLink>

                    <ExternalLink link={urls.termsOfService}>
                        <FormattedMessage id="legal.docs.terms" />
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
                                value={acknowledgedDocuments}
                                required
                                icon={<Square style={{ fontSize: 14 }} />}
                                checkedIcon={
                                    <CheckSquare style={{ fontSize: 14 }} />
                                }
                            />
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
