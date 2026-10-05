import { useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import darkMark from 'src/images/pictorial-marks/pictorial-mark__multi-blue.png';
import lightMark from 'src/images/pictorial-marks/pictorial-mark__white.png';

function CompanyMark() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? lightMark : darkMark}
            height="21px"
            style={{ marginTop: '4px' }}
            alt={intl.formatMessage({ id: 'company' })}
        />
    );
}

export default CompanyMark;
