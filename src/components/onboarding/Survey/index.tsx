import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';

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
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
}

export function OnboardingSurvey({ disabled, value, onChange }: Props) {
    return (
        <FormControl disabled={disabled} required fullWidth>
            <FormLabel id="survey-label" required sx={{ mb: 1, fontSize: 20 }}>
                Where did you hear about Estuary?
            </FormLabel>

            <Select
                labelId="survey-label"
                id="survey-origin"
                name="origin"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                displayEmpty
                size="small"
                variant="outlined"
                sx={{
                    'bgcolor': 'background.default',
                    'borderRadius': 3,
                    '& fieldset': { border: 'none' },
                }}
            >
                <MenuItem value="" disabled>
                    Select an option
                </MenuItem>
                {originOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
