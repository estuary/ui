import { useTheme } from '@mui/material';
import darkDemo from 'src/images/demo_dark.png';
import lightDemo from 'src/images/demo_light.png';
import { useIntl } from 'react-intl';

function DemoImage() {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'light' ? lightDemo : darkDemo}
            style={{
                marginBottom: 16,
            }}
            width="75%"
            alt={intl.formatMessage({ id: 'welcome.demo.alt' })}
        />
    );
}

export default DemoImage;
