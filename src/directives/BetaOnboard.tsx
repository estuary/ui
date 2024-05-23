import {
    Box,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import SafeLoadingButton from 'components/SafeLoadingButton';
import AlertBox from 'components/shared/AlertBox';
import CustomerQuote from 'directives/Onboard/CustomerQuote';
import OrganizationNameField from 'directives/Onboard/OrganizationName';
import {
    useOnboardingStore_nameInvalid,
    useOnboardingStore_nameMissing,
    useOnboardingStore_requestedTenant,
    useOnboardingStore_resetState,
    useOnboardingStore_setNameMissing,
    useOnboardingStore_surveyResponse,
} from 'directives/Onboard/Store/hooks';
import OnboardingSurvey from 'directives/Onboard/Survey';
import useJobStatusPoller from 'hooks/useJobStatusPoller';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMount, useUnmount } from 'react-use';
import { fireGtmEvent } from 'services/gtm';
import { hasLength } from 'utils/misc-utils';
import { jobStatusQuery, trackEvent } from './shared';
import { DirectiveProps } from './types';

const directiveName = 'betaOnboard';

const submit_onboard = async (
    requestedTenant: string,
    directive: any,
    surveyResponse: any
) => {
    return submitDirective(
        directiveName,
        directive,
        requestedTenant,
        surveyResponse
    );
};

const BetaOnboard = ({ directive, mutate }: DirectiveProps) => {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const { jobStatusPoller } = useJobStatusPoller();

    // Onboarding Store
    const requestedTenant = useOnboardingStore_requestedTenant();
    const nameInvalid = useOnboardingStore_nameInvalid();
    const nameMissing = useOnboardingStore_nameMissing();
    const setNameMissing = useOnboardingStore_setNameMissing();
    const surveyResponse = useOnboardingStore_surveyResponse();
    const resetOnboardingState = useOnboardingStore_resetState();

    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handlers = {
        submit: async (event: any) => {
            event.preventDefault();

            if (nameInvalid || !hasLength(requestedTenant)) {
                if (!hasLength(requestedTenant)) {
                    setNameMissing(true);
                }

                setServerError(null);
            } else {
                setServerError(null);
                setNameMissing(false);
                setSaving(true);

                const onboardingResponse = await submit_onboard(
                    requestedTenant,
                    directive,
                    surveyResponse
                );

                if (onboardingResponse.error) {
                    setSaving(false);

                    return setServerError(
                        (onboardingResponse.error as PostgrestError).message
                    );
                }

                const data = onboardingResponse.data[0];
                jobStatusPoller(
                    jobStatusQuery(data),
                    async () => {
                        fireGtmEvent('Register', {
                            tenant: requestedTenant,
                        });
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
    useUnmount(() => resetOnboardingState());

    return (
        <Stack direction="row">
            <CustomerQuote hideQuote={belowMd} />

            <Stack sx={{ width: belowMd ? '100%' : '50%' }}>
                <Stack
                    spacing={2}
                    sx={{
                        mt: 1,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'left',
                    }}
                >
                    <Typography
                        variant="h5"
                        align={belowMd ? 'center' : 'left'}
                        sx={{ mb: 1.5 }}
                    >
                        <FormattedMessage id="tenant.heading" />
                    </Typography>

                    {nameMissing ? (
                        <Box sx={{ maxWidth: 424 }}>
                            <AlertBox
                                short
                                severity="error"
                                title={<FormattedMessage id="error.title" />}
                            >
                                <FormattedMessage id="tenant.errorMessage.empty" />
                            </AlertBox>
                        </Box>
                    ) : null}

                    {serverError ? (
                        <Box sx={{ maxWidth: 424 }}>
                            <AlertBox
                                severity="error"
                                short
                                title={<FormattedMessage id="common.fail" />}
                            >
                                {serverError}
                            </AlertBox>
                        </Box>
                    ) : null}
                </Stack>

                <form noValidate onSubmit={handlers.submit}>
                    <Stack
                        spacing={3}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                            justifyContent: 'center',
                        }}
                    >
                        <OrganizationNameField />

                        <OnboardingSurvey />

                        <Toolbar
                            disableGutters
                            sx={{
                                justifyContent: belowMd
                                    ? 'center'
                                    : 'flex-start',
                            }}
                        >
                            <SafeLoadingButton
                                type="submit"
                                variant="contained"
                                loading={saving}
                                disabled={saving}
                            >
                                <FormattedMessage id="cta.continue" />
                            </SafeLoadingButton>
                        </Toolbar>
                    </Stack>
                </form>
            </Stack>
        </Stack>
    );
};

export default BetaOnboard;
