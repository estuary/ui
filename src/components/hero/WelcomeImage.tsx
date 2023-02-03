import { useTheme } from '@mui/material';
import darkWelcome from 'images/welcome_dark.svg';
import lightWelcome from 'images/welcome_light.svg';
import { useIntl } from 'react-intl';

function WelcomeImage() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'dark' ? darkWelcome : lightWelcome}
            style={{ marginBottom: 16 }}
            width="100%"
            alt={intl.formatMessage({ id: 'welcome.image.alt' })}
        />
    );
}

export default WelcomeImage;
