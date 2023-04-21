import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from '@mui/material';
import { useOnboardingStore_surveyOptionOther } from 'directives/Onboard/Store/hooks';
import React, { ChangeEvent, SetStateAction } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useConstant from 'use-constant';
import { hasLength } from 'utils/misc-utils';

export interface SurveyResponse {
    origin: string;
    details: string;
}

interface Props {
    surveyResponse: SurveyResponse;
    surveyResultsMissing: boolean;
    setSurveyResponse: React.Dispatch<SetStateAction<SurveyResponse>>;
    setSurveyResultsMissing: React.Dispatch<SetStateAction<boolean>>;
}

function OnboardingSurvey({
    surveyResponse,
    surveyResultsMissing,
    setSurveyResponse,
    setSurveyResultsMissing,
}: Props) {
    const intl = useIntl();

    const surveyOptionOther = useOnboardingStore_surveyOptionOther();

    const originOptions: string[] = useConstant(() => [
        intl.formatMessage({ id: 'tenant.origin.radio.browserSearch.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.linkedIn.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.referral.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.youTube.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.email.label' }),
        intl.formatMessage({ id: 'tenant.origin.radio.gitHub.label' }),
        surveyOptionOther,
    ]);

    const handlers = {
        updateSurveyOrigin: (
            _event: ChangeEvent<HTMLInputElement>,
            value: string
        ) => {
            const { details } = surveyResponse;

            setSurveyResponse({ origin: value, details });

            setSurveyResultsMissing(
                value === surveyOptionOther && surveyResultsMissing
                    ? !hasLength(details)
                    : false
            );
        },
        updateSurveyDetails: (value: string) => {
            const { origin } = surveyResponse;

            setSurveyResponse({ origin, details: value });

            if (surveyResultsMissing && origin === surveyOptionOther) {
                setSurveyResultsMissing(!hasLength(value));
            }
        },
    };

    return (
        <FormControl>
            <FormLabel id="origin" required sx={{ mb: 1, fontSize: 16 }}>
                <FormattedMessage id="tenant.origin.radioGroup.label" />
            </FormLabel>

            <RadioGroup
                aria-labelledby="survey-radio-buttons-group-label"
                name="radio-buttons-group"
                onChange={handlers.updateSurveyOrigin}
                sx={{ width: 'fit-content' }}
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
                size="small"
                onChange={(event) =>
                    handlers.updateSurveyDetails(event.target.value)
                }
                sx={{
                    'maxWidth': 400,
                    'ml': 3,
                    '& .MuiInputBase-root': { borderRadius: 3 },
                }}
            />
        </FormControl>
    );
}

export default OnboardingSurvey;
