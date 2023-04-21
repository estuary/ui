import { LoadingButton } from '@mui/lab';
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
import AlertBox from 'components/shared/AlertBox';
import OrganizationNameField from 'directives/Onboard/OrganizationName';
import OnboardingSurvey from 'directives/Onboard/Survey';
import customerQuoteDark from 'images/customer_quote-dark.png';
import customerQuoteLight from 'images/customer_quote-light.png';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fireGtmEvent } from 'services/gtm';
import { jobStatusPoller } from 'services/supabase';
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

const getValidationErrorMessageId = (
    nameMissing: boolean,
    surveyResultsMissing: boolean
): string => {
    if (nameMissing && surveyResultsMissing) {
        return 'tenant.errorMessage.missingOrganizationAndSurvey';
    } else {
        return nameMissing
            ? 'tenant.errorMessage.empty'
            : 'tenant.errorMessage.missingSurvey';
    }
};

const BetaOnboard = ({ directive, mutate }: DirectiveProps) => {
    trackEvent(`${directiveName}:Viewed`);

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    const intl = useIntl();
    const surveyOptionOther = intl.formatMessage({
        id: 'tenant.origin.radio.other.label',
    });

    const [requestedTenant, setRequestedTenant] = useState<string>('');
    const [saving, setSaving] = useState(false);

    const [nameMissing, setNameMissing] = useState(false);
    const [nameInvalid, setNameInvalid] = useState(false);

    const [surveyResponse, setSurveyResponse] = useState<{
        origin: string;
        details: string;
    }>({ origin: '', details: '' });

    const [surveyResultsMissing, setSurveyResultsMissing] =
        useState<boolean>(false);

    const [serverError, setServerError] = useState<string | null>(null);

    const handlers = {
        submit: async (event: any) => {
            event.preventDefault();

            if (
                !hasLength(requestedTenant) ||
                nameInvalid ||
                !hasLength(surveyResponse.origin) ||
                (surveyResponse.origin === surveyOptionOther &&
                    !hasLength(surveyResponse.details))
            ) {
                if (!hasLength(requestedTenant)) {
                    setNameMissing(true);
                }

                if (
                    !hasLength(surveyResponse.origin) ||
                    (surveyResponse.origin === surveyOptionOther &&
                        !hasLength(surveyResponse.details))
                ) {
                    setSurveyResultsMissing(true);
                }

                setServerError(null);
            } else {
                setServerError(null);
                setNameMissing(false);
                setSurveyResultsMissing(false);
                setSaving(true);

                const clickToAcceptResponse = await submit_onboard(
                    requestedTenant,
                    directive,
                    surveyResponse
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

    return (
        <Stack direction="row">
            {belowMd ? null : (
                <Box
                    sx={{
                        width: '50%',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={
                            theme.palette.mode === 'light'
                                ? customerQuoteLight
                                : customerQuoteDark
                        }
                        width="85%"
                        alt={intl.formatMessage({ id: 'company' })}
                    />
                </Box>
            )}

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

                    {nameMissing || surveyResultsMissing ? (
                        <Box sx={{ maxWidth: 424 }}>
                            <AlertBox
                                short
                                severity="error"
                                title={<FormattedMessage id="error.title" />}
                            >
                                <FormattedMessage
                                    id={getValidationErrorMessageId(
                                        nameMissing,
                                        surveyResultsMissing
                                    )}
                                />
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
                        <OrganizationNameField
                            nameInvalid={nameInvalid}
                            nameMissing={nameMissing}
                            requestedTenant={requestedTenant}
                            setNameInvalid={setNameInvalid}
                            setNameMissing={setNameMissing}
                            setRequestedTenant={setRequestedTenant}
                        />

                        <OnboardingSurvey
                            surveyOptionOther={surveyOptionOther}
                            surveyResponse={surveyResponse}
                            surveyResultsMissing={surveyResultsMissing}
                            setSurveyResponse={setSurveyResponse}
                            setSurveyResultsMissing={setSurveyResultsMissing}
                        />

                        <Toolbar
                            disableGutters
                            sx={{
                                justifyContent: belowMd
                                    ? 'center'
                                    : 'flex-start',
                            }}
                        >
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
            </Stack>
        </Stack>
    );
};

export default BetaOnboard;
