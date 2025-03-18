import {
    Chip,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import { chipOutlinedStyling } from 'context/Theme';
import {
    useOnboardingStore_setSurveyResponse,
    useOnboardingStore_surveyOptionOther,
    useOnboardingStore_surveyResponse,
} from 'directives/Onboard/Store/hooks';
import { ChangeEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useConstant from 'use-constant';

export interface SurveyResponse {
    origin: string;
    details: string;
}

function OnboardingSurvey() {
    const intl = useIntl();

    // Onboarding Store
    const surveyOptionOther = useOnboardingStore_surveyOptionOther();

    const surveyResponse = useOnboardingStore_surveyResponse();
    const setSurveyResponse = useOnboardingStore_setSurveyResponse();

    const originOptions: string[] = useConstant(() => [
        intl.formatMessage({ id: 'tenant.origin.radio.browserSearch.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.linkedIn.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.referral.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.youTube.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.email.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.gitHub.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.paidAdvertising.label' }),
        surveyOptionOther,
    ]);

    const handlers = {
        updateSurveyOrigin: (
            _event: ChangeEvent<HTMLInputElement>,
            value: string
        ) => {
            const { details } = surveyResponse;

            setSurveyResponse({ origin: value, details });
        },
        updateSurveyDetails: (value: string) => {
            const { origin } = surveyResponse;

            setSurveyResponse({ origin, details: value });
        },
    };

    return (
        <FormControl>
            <FormLabel
                id="survey-radio-buttons-group-label"
                required
                sx={{ mb: 1, fontSize: 16 }}
            >
                <FormattedMessage id="tenant.origin.radioGroup.label" />
            </FormLabel>

            <RadioGroup
                aria-labelledby="survey-radio-buttons-group-label"
                name="survey-radio-buttons-group"
                onChange={handlers.updateSurveyOrigin}
                row
                sx={{
                    'gap': 1,
                    '& .MuiFormControlLabel-root': {
                        ml: 0,
                        mr: 0,
                    },
                    '& .MuiChip-root': {
                        p: 1,
                    },
                    '& .MuiRadio-root': {
                        display: 'none',
                        visibility: 'hidden',
                    },
                }}
            >
                {originOptions.map((option, index) => {
                    const currentOption = surveyResponse.origin === option;

                    return (
                        <FormControlLabel
                            disableTypography
                            key={`${option}-${index}`}
                            value={option}
                            control={<Radio size="small" />}
                            label={
                                <Chip
                                    component="span"
                                    color={
                                        currentOption ? 'primary' : undefined
                                    }
                                    variant="outlined"
                                    label={option}
                                    sx={{
                                        ...chipOutlinedStyling,
                                        p: 0,
                                    }}
                                />
                            }
                        />
                    );
                })}
            </RadioGroup>
        </FormControl>
    );
}

export default OnboardingSurvey;
