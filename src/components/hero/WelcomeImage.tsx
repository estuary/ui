import { useTheme } from '@mui/material';
import { useIntl } from 'react-intl';

function WelcomeImage() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={`https://www.estuary.dev/wp-content/uploads/2023/02/welcome_${theme.palette.mode}.png`}
            style={{ marginBottom: 16 }}
            width="75%"
            alt={intl.formatMessage({ id: 'welcome.image.alt' })}
        />
    );
}

export default WelcomeImage;
