import { useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import darkLogo from 'src/images/combination-marks/combination-mark__multi-blue.png';
import lightLogo from 'src/images/combination-marks/combination-mark__white.png';

function CompanyLogo() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? lightLogo : darkLogo}
            height="30px"
            width="150px"
            alt={intl.formatMessage({ id: 'company' })}
        />
    );
}

export default CompanyLogo;
