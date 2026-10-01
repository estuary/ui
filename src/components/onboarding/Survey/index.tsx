import type { SxProps, Theme } from '@mui/material';

import {
    chipClasses,
    FormControl,
    formControlLabelClasses,
    FormLabel,
    radioClasses,
    RadioGroup,
} from '@mui/material';

import { OriginOption } from 'src/components/onboarding/Survey/OriginOption';

const hiddenButAccessibleRadio: SxProps<Theme> = {
    [`& .${radioClasses.root}, & .${radioClasses.root} input`]: {
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
    },
};

const originOptions = [
    'Google / Search Engine',
    'Online Ads',
    'AI Assistant',
    'Blog',
    'Word of Mouth',
    'Webinar',
    'Reddit',
    'LinkedIn',
    'Social Media',
    'Other',
];

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export function OnboardingSurvey({ value, onChange }: Props) {
    return (
        <FormControl component="fieldset" required>
            <FormLabel
                component="legend"
                id="survey-radio-buttons-group-label"
                required
                sx={{ mb: 1, fontSize: 16 }}
            >
                Where did you hear about Estuary?
            </FormLabel>

            <RadioGroup
                aria-labelledby="survey-radio-buttons-group-label"
                name="survey-radio-buttons-group"
                value={value}
                onChange={(_event, selected) => onChange(selected)}
                row
                sx={{
                    ...hiddenButAccessibleRadio,
                    gap: 1,
                    [`& .${formControlLabelClasses.root}`]: {
                        ml: 0,
                        mr: 0,
                    },
                    [`& .${chipClasses.root}`]: {
                        p: 1,
                    },
                }}
            >
                {originOptions.map((option, index) => {
                    return (
                        <OriginOption
                            optionLabel={option}
                            selected={value === option}
                            key={`${option}-${index}`}
                        />
                    );
                })}
            </RadioGroup>
        </FormControl>
    );
}
