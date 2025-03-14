import { Box, FormControlLabel, Radio, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { MenuOptionProps } from './types';

export default function MenuOption({
    descriptionId,
    labelId,
    value,
}: MenuOptionProps) {
    const intl = useIntl();

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
                        {intl.formatMessage({
                            id: labelId,
                        })}
                    </Typography>

                    <Typography
                        sx={{
                            'textTransform': 'lowercase',
                            '&.MuiTypography-root:first-letter': {
                                textTransform: 'uppercase',
                            },
                        }}
                    >
                        {intl.formatMessage({
                            id: descriptionId,
                        })}
                    </Typography>
                </Box>
            }
            style={{ alignItems: 'flex-start' }}
        />
    );
}
