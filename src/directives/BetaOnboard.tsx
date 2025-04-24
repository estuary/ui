import type { PostgrestError } from '@supabase/postgrest-js';
import type { DirectiveProps } from 'src/directives/types';

import { useState } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';
import { useMount, useUnmount } from 'react-use';

import { submitDirective } from 'src/api/directives';
import RegistrationProgress from 'src/app/guards/RegistrationProgress';
import AlertBox from 'src/components/shared/AlertBox';
import Actions from 'src/directives/Actions';
import OrganizationNameField from 'src/directives/Onboard/OrganizationName';
import {
    useOnboardingStore_nameInvalid,
    useOnboardingStore_nameMissing,
    useOnboardingStore_requestedTenant,
    useOnboardingStore_resetState,
    useOnboardingStore_setNameMissing,
    useOnboardingStore_setSurveyMissing,
    useOnboardingStore_surveyMissing,
    useOnboardingStore_surveyResponse,
} from 'src/directives/Onboard/Store/hooks';
import OnboardingSurvey from 'src/directives/Onboard/Survey';
import { jobStatusQuery, trackEvent } from 'src/directives/shared';
import useJobStatusPoller from 'src/hooks/useJobStatusPoller';
import HeaderMessage from 'src/pages/login/HeaderMessage';
import { fireGtmEvent } from 'src/services/gtm';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { hasLength } from 'src/utils/misc-utils';

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
    const surveyMissing = useOnboardingStore_surveyMissing();
    const setSurveyMissing = useOnboardingStore_setSurveyMissing();

    const surveyResponse = useOnboardingStore_surveyResponse();
    const resetOnboardingState = useOnboardingStore_resetState();

    const [nameTaken, setNameTaken] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const handlers = {
        submit: async (event: any) => {
            event.preventDefault();

            if (
                nameInvalid ||
                !hasLength(requestedTenant) ||
                surveyResponse.origin === ''
            ) {
                const noNameProvided = Boolean(
                    !requestedTenant || requestedTenant.length === 0
                );
                const noSurveyProvided = Boolean(surveyResponse.origin === '');
                setNameMissing(noNameProvided);
                setSurveyMissing(noSurveyProvided);

                setServerError(null);

                logRocketEvent(CustomEvents.ONBOARDING, {
                    nameInvalid,
                    nameMissing: noNameProvided,
                    surveyMissing: noSurveyProvided,
                });

                return;
            }

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
                        ignore_referrer: true,
                    });
                    trackEvent(`${directiveName}:Complete`, directive);
                    void mutate();
                },
                async (payload: any) => {
                    const tenantTaken = Boolean(
                        payload?.job_status?.error?.includes(NAME_TAKEN_MESSAGE)
                    );

                    // Handle tracking right away
                    fireGtmEvent('RegisterFailed', {
                        tenantAlreadyTaken: tenantTaken,
                        tenant: requestedTenant,
                        ignore_referrer: true,
                    });
                    trackEvent(`${directiveName}:Error`, directive);

                    // Update local state
                    setSaving(false);
                    setServerError(payload?.job_status?.error);
                    setNameTaken(tenantTaken);
                }
            );
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

                {nameMissing || surveyMissing || nameInvalid ? (
                    <Box>
                        <AlertBox
                            short
                            severity="error"
                            title={<FormattedMessage id="error.title" />}
                        >
                            {nameMissing ? (
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'tenant.errorMessage.empty',
                                    })}
                                </Typography>
                            ) : null}

                            {nameInvalid ? (
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'tenant.errorMessage.invalid',
                                    })}
                                </Typography>
                            ) : null}

                            {surveyMissing ? (
                                <Typography>
                                    {intl.formatMessage({
                                        id: 'tenant.origin.errorMessage.empty',
                                    })}
                                </Typography>
                            ) : null}
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
