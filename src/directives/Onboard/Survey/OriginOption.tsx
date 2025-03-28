import type { OriginOptionProps } from 'src/directives/Onboard/Survey/types';

import { Chip, FormControlLabel, Radio } from '@mui/material';

import { chipOutlinedStyling } from 'src/context/Theme';
import { useOnboardingStore_surveyResponse } from 'src/directives/Onboard/Store/hooks';

function OriginOption({ optionLabel: option }: OriginOptionProps) {
    const surveyResponse = useOnboardingStore_surveyResponse();
    const currentOption = surveyResponse.origin === option;

    const labelId = `${option} label`;
    const inputId = `${option} input`;

    return (
        <FormControlLabel
            disableTypography
            value={option}
            control={<Radio id={inputId} size="small" />}
            htmlFor={inputId}
            label={
                <Chip
                    component="span"
                    color={currentOption ? 'primary' : undefined}
                    id={labelId}
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
}

export default OriginOption;
