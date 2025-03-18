import { Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import RegistrationProgress from 'app/guards/RegistrationProgress';
import SafeLoadingButton from 'components/SafeLoadingButton';
import AlertBox from 'components/shared/AlertBox';
import { supabaseClient } from 'context/GlobalProviders';
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
import HeaderMessage from 'pages/login/HeaderMessage';
import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';
import { fireGtmEvent } from 'services/gtm';
import { hasLength } from 'utils/misc-utils';
import { jobStatusQuery, trackEvent } from './shared';
import { DirectiveProps } from './types';

const directiveName = 'betaOnboard';
const nameTaken = 'is already in use';

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
    const intl = useIntl();

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

    const nameAlreadyUsed = useMemo(
        () => serverError?.includes(nameTaken),
        [serverError]
    );

    useMount(() => {
        trackEvent(`${directiveName}:Viewed`);
    });
    useUnmount(() => resetOnboardingState());

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
                <RegistrationProgress step={2} loading={saving} />

                <HeaderMessage isRegister />

                {nameMissing ? (
                    <Box sx={{ maxWidth: 424 }}>
                        <AlertBox
                            short
                            severity="error"
                            title={<FormattedMessage id="error.title" />}
                        >
                            <Typography>
                                {intl.formatMessage({
                                    id: 'tenant.errorMessage.empty',
                                })}
                            </Typography>
                        </AlertBox>
                    </Box>
                ) : null}

                {serverError ? (
                    <Box sx={{ maxWidth: 424 }}>
                        <AlertBox
                            severity="error"
                            short
                            title={intl.formatMessage({ id: 'common.fail' })}
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
                    <OrganizationNameField forceError={nameAlreadyUsed} />

                    <OnboardingSurvey />

                    <Toolbar
                        disableGutters
                        sx={{
                            justifyContent: 'space-between',
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
                            {intl.formatMessage({ id: 'cta.registerFinish' })}
                        </SafeLoadingButton>
                    </Toolbar>
                </Stack>
            </form>
        </>
    );
};

export default BetaOnboard;
