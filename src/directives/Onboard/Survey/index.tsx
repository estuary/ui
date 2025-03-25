import { FormControl, FormLabel, RadioGroup } from '@mui/material';
import { hiddenButAccessibleRadio } from 'context/Theme';
import {
    useOnboardingStore_setSurveyResponse,
    useOnboardingStore_surveyOptionOther,
    useOnboardingStore_surveyResponse,
} from 'directives/Onboard/Store/hooks';
import type { ChangeEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useConstant from 'use-constant';
import OriginOption from './OriginOption';

function OnboardingSurvey() {
    const intl = useIntl();

    // Onboarding Store
    const surveyOptionOther = useOnboardingStore_surveyOptionOther();

    const surveyResponse = useOnboardingStore_surveyResponse();
    const setSurveyResponse = useOnboardingStore_setSurveyResponse();

    const originOptions: string[] = useConstant(() => [
        intl.formatMessage({ id: 'tenant.origin.radio.browserSearch.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.paidAdvertising.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.content.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.referral.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.webinar.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.reddit.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.linkedIn.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.socialMedia.label' }),
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
        <FormControl
            component="fieldset"
            sx={{
                border: 'none',
            }}
        >
            <FormLabel
                component="legend"
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
                    ...hiddenButAccessibleRadio,
                    'gap': 1,
                    '& .MuiFormControlLabel-root': {
                        ml: 0,
                        mr: 0,
                    },
                    '& .MuiChip-root': {
                        p: 1,
                    },
                }}
            >
                {originOptions.map((option, index) => {
                    return (
                        <OriginOption
                            optionLabel={option}
                            key={`${option}-${index}`}
                        />
                    );
                })}
            </RadioGroup>
        </FormControl>
    );
}

export default OnboardingSurvey;
