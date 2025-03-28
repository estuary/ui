import { useTheme } from '@mui/material';
import darkWelcome from 'src/images/welcome_dark.png';
import lightWelcome from 'src/images/welcome_light.png';
import { useIntl } from 'react-intl';

function WelcomeImage() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'light' ? lightWelcome : darkWelcome}
            style={{
                marginBottom: 16,
            }}
            width="75%"
            alt={intl.formatMessage({ id: 'welcome.image.alt' })}
        />
    );
}

export default WelcomeImage;
