import { LoadingButton } from '@mui/lab';
import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/postgrest-js';
import { submitDirective } from 'api/directives';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { ChangeEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fireGtmEvent } from 'services/gtm';
import { jobStatusPoller } from 'services/supabase';
import useConstant from 'use-constant';
import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
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

    const intl = useIntl();
    const surveyOptionOther = intl.formatMessage({
        id: 'tenant.origin.radio.other.label',
    });

    const originOptions = useConstant(() => [
        intl.formatMessage({ id: 'tenant.origin.radio.browserSearch.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.linkedin.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.referral.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.youtube.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.email.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.github.label' }),
        surveyOptionOther,
    ]);

    const [requestedTenant, setRequestedTenant] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [nameMissing, setNameMissing] = useState(false);

    const [surveyResponse, setSurveyResponse] = useState<{
        origin: string;
        details: string;
    }>({ origin: '', details: '' });

    const [surveyResultsMissing, setSurveyResultsMissing] =
        useState<boolean>(false);

    const [serverError, setServerError] = useState<string | null>(null);

    const handlers = {
        update: (updatedValue: string) => {
            setRequestedTenant(updatedValue);

            if (nameMissing) setNameMissing(!hasLength(updatedValue));
        },
        updateSurveyOrigin: (
            _event: ChangeEvent<HTMLInputElement>,
            value: string
        ) => {
            const { details } = surveyResponse;

            setSurveyResponse({ origin: value, details });

            setSurveyResultsMissing(
                value === surveyOptionOther ? !hasLength(details) : false
            );
        },
        updateSurveyDetails: (value: string) => {
            const { origin } = surveyResponse;

            setSurveyResponse({ origin, details: value });

            if (surveyResultsMissing && origin === surveyOptionOther) {
                setSurveyResultsMissing(!hasLength(value));
            }
        },
        submit: async (event: any) => {
            event.preventDefault();

            if (
                !hasLength(requestedTenant) ||
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

    // const surveyResponseDetailsRequired = useMemo(
    //     () =>
    //         surveyResultsMissing && surveyResponse.origin === surveyOptionOther,
    //     [surveyOptionOther, surveyResponse.origin, surveyResultsMissing]
    // );

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

                {nameMissing || surveyResultsMissing ? (
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
                        label={
                            <FormattedMessage id="common.tenant.creationForm" />
                        }
                        value={requestedTenant}
                        onChange={(event) =>
                            handlers.update(event.target.value)
                        }
                        required
                        inputProps={{
                            pattern: PREFIX_NAME_PATTERN,
                        }}
                    />

                    <FormControl>
                        <FormLabel id="origin">
                            <FormattedMessage id="tenant.origin.radioGroup.label" />
                        </FormLabel>

                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            onChange={handlers.updateSurveyOrigin}
                        >
                            {originOptions.map((option, index) => (
                                <FormControlLabel
                                    key={`${option}-${index}`}
                                    value={option}
                                    control={<Radio size="small" />}
                                    label={option}
                                />
                            ))}
                        </RadioGroup>

                        <TextField
                            // error={surveyResponseDetailsRequired}
                            onChange={(event) =>
                                handlers.updateSurveyDetails(event.target.value)
                            }
                            sx={{ ml: 3 }}
                        />
                    </FormControl>

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
