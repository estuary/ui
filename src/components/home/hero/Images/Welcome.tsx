import { useTheme } from '@mui/material';

import darkWelcome from 'src/images/welcome_dark.png';
import lightWelcome from 'src/images/welcome_light.png';

function WelcomeImage() {
    const theme = useTheme();

    return (
        <img
            src={theme.palette.mode === 'light' ? lightWelcome : darkWelcome}
            style={{
                marginBottom: 16,
            }}
            width="75%"
            alt="A diagram showing the Estuary logo at the center, connected by pipelines to multiple endpoint systems. Source systems on the left feed data into Estuary and destination systems on the right receive data from Estuary."
        />
    );
}

export default WelcomeImage;
