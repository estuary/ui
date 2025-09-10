import type { RadioMenuItemProps } from 'src/components/shared/types';

import { Box, FormControlLabel, Radio, Typography } from '@mui/material';

export default function RadioMenuItem({
    description,
    descriptionTextTransform,
    label,
    value,
}: RadioMenuItemProps) {
    return (
        <FormControlLabel
            value={value}
            control={<Radio size="small" />}
            label={
                <Box style={{ padding: '8px 0px' }}>
                    <Typography
                        sx={{
                            mb: '4px',
                            fontWeight: 500,
                        }}
                    >
                        {label}
                    </Typography>

                    <Typography
                        sx={{
                            'textTransform':
                                descriptionTextTransform ?? 'lowercase',
                            '&.MuiTypography-root:first-letter': {
                                textTransform: 'uppercase',
                            },
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            }
            style={{ alignItems: 'flex-start' }}
        />
    );
}
