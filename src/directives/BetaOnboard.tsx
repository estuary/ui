import { Box, Stack, Typography } from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import RegistrationProgress from 'app/guards/RegistrationProgress';
import AlertBox from 'components/shared/AlertBox';
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
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';
import { fireGtmEvent } from 'services/gtm';
import { hasLength } from 'utils/misc-utils';
import Actions from './Actions';
import { jobStatusQuery, trackEvent } from './shared';
import { DirectiveProps } from './types';

const directiveName = 'betaOnboard';
const NAME_TAKEN_MESSAGE = 'is already in use';

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

const BetaOnboard = ({ directive, mutate, status }: DirectiveProps) => {
    const intl = useIntl();

    const { jobStatusPoller } = useJobStatusPoller();

    // Onboarding Store
    const requestedTenant = useOnboardingStore_requestedTenant();
    const nameInvalid = useOnboardingStore_nameInvalid();
    const nameMissing = useOnboardingStore_nameMissing();
    const setNameMissing = useOnboardingStore_setNameMissing();
    const surveyResponse = useOnboardingStore_surveyResponse();
    const resetOnboardingState = useOnboardingStore_resetState();

    const [nameTaken, setNameTaken] = useState(false);
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
                        const tenantTaken = Boolean(
                            payload?.job_status?.error?.includes(
                                NAME_TAKEN_MESSAGE
                            )
                        );

                        // Handle tracking right away
                        fireGtmEvent('RegisterFailed', {
                            tenantAlreadyTaken: tenantTaken,
                            tenant: requestedTenant,
                        });
                        trackEvent(`${directiveName}:Error`, directive);

                        // Update local state
                        setSaving(false);
                        setServerError(payload?.job_status?.error);
                        setNameTaken(tenantTaken);
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
        <>
            <Stack
                spacing={3}
                sx={{
                    mt: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'left',
                }}
            >
                <RegistrationProgress
                    step={2}
                    loading={saving}
                    status={status}
                />

                <HeaderMessage isRegister />

                {serverError ? (
                    <Box>
                        <AlertBox
                            severity="error"
                            short
                            title={intl.formatMessage({
                                id: 'common.fail',
                            })}
                        >
                            {serverError}
                        </AlertBox>
                    </Box>
                ) : null}

                {nameMissing ? (
                    <Box>
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
                        mt: 5,
                    }}
                >
                    <OrganizationNameField forceError={nameTaken} />

                    <OnboardingSurvey />

                    <Actions
                        saving={saving}
                        primaryMessageId="cta.registerFinish"
                    />
                </Stack>
            </form>
        </>
    );
};

export default BetaOnboard;
