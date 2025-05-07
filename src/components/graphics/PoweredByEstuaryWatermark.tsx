import { Stack, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import multiBlueLogo from 'src/images/pictorial-marks/pictorial-mark__multi-blue.png';
import whiteLogo from 'src/images/pictorial-marks/pictorial-mark__white.png';

export const PoweredByEstuaryWatermark = () => {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Stack direction="row" style={{ alignItems: 'center' }}>
            <img
                alt={intl.formatMessage({ id: 'company' })}
                height={18}
                src={theme.palette.mode === 'dark' ? whiteLogo : multiBlueLogo}
            />

            <Typography
                component="span"
                style={{
                    fontWeight: 500,
                    marginBottom: 4,
                    marginLeft: 6,
                    textTransform: 'uppercase',
                }}
                variant="caption"
            >
                {intl.formatMessage({ id: 'expressFlowIntegration' })}
            </Typography>
        </Stack>
    );
};
