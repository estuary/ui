import { Box, FormControlLabel, Radio, Typography } from '@mui/material';

import type { RadioMenuItemProps } from 'src/components/shared/types';

export default function RadioMenuItem({
    description,
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
                            'textTransform': 'lowercase',
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
