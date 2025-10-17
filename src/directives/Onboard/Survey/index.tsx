import type { ChangeEvent } from 'react';

import useConstant from 'use-constant';

import { FormControl, FormLabel, RadioGroup } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { hiddenButAccessibleRadio } from 'src/context/Theme';
import {
    useOnboardingStore_setSurveyMissing,
    useOnboardingStore_setSurveyResponse,
    useOnboardingStore_surveyMissing,
    useOnboardingStore_surveyResponse,
} from 'src/directives/Onboard/Store/hooks';
import OriginOption from 'src/directives/Onboard/Survey/OriginOption';

function OnboardingSurvey() {
    const intl = useIntl();

    // Onboarding Store
    const surveyResponse = useOnboardingStore_surveyResponse();
    const setSurveyResponse = useOnboardingStore_setSurveyResponse();
    const surveyMissing = useOnboardingStore_surveyMissing();
    const setSurveyMissing = useOnboardingStore_setSurveyMissing();

    const originOptions: string[] = useConstant(() => [
        intl.formatMessage({ id: 'tenant.origin.radio.browserSearch.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.paidAdvertising.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.ai.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.content.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.referral.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.webinar.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.reddit.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.linkedIn.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.socialMedia.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.other.label' }),
    ]);

    const handlers = {
        updateSurveyOrigin: (
            _event: ChangeEvent<HTMLInputElement>,
            value: string
        ) => {
            const { details } = surveyResponse;

            setSurveyResponse({ origin: value, details });
            setSurveyMissing(false);
        },
    };

    return (
        <FormControl
            component="fieldset"
            error={surveyMissing}
            required
            sx={{
                border: 'none',
            }}
        >
            <FormLabel
                error={surveyMissing}
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
