import { useTheme } from '@mui/material';
import darkLogo from 'images/combination-marks/combination-mark__multi-blue.png';
import lightLogo from 'images/combination-marks/combination-mark__white.png';
import { useIntl } from 'react-intl';

function CompanyLogo() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? lightLogo : darkLogo}
            style={{ marginBottom: 16 }}
            width={200}
            alt={intl.formatMessage({ id: 'company' })}
        />
    );
}

export default CompanyLogo;
