import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';
import { useIntl } from 'react-intl';

function ModeSwitch() {
    const intl = useIntl();
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Tooltip
            title={intl.formatMessage({
                id: 'modeSwitch.label',
            })}
            placement="right-end"
        >
            <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === 'dark' ? (
                    <ModeNightIcon />
                ) : (
                    <WbSunnyIcon />
                )}
            </IconButton>
        </Tooltip>
    );
}

export default ModeSwitch;
