import { Chip, FormControlLabel, Radio } from '@mui/material';

import { chipOutlinedStyling } from 'src/context/Theme';

interface Props {
    optionLabel: string;
    selected: boolean;
}

export function OriginOption({ optionLabel: option, selected }: Props) {
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
                    color={selected ? 'primary' : undefined}
                    id={labelId}
                    variant="outlined"
                    label={option}
                    sx={{
                        ...chipOutlinedStyling,
                        p: 0,
                        boxShadow: selected
                            ? (theme) =>
                                  `inset 0 0 0 2px ${theme.palette.primary.main}, 0 2px 6px rgba(0, 0, 0, 0.16)`
                            : 'none',
                    }}
                />
            }
        />
    );
}
