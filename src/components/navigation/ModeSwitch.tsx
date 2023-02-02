import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useTheme,
} from '@mui/material';
import { useColorMode } from 'context/Theme';
import { FormattedMessage, useIntl } from 'react-intl';

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
            <ListItemButton
                component="a"
                onClick={colorMode.toggleColorMode}
                sx={{
                    whiteSpace: 'nowrap',
                    px: 1.5,
                }}
            >
                <ListItemIcon
                    sx={{ minWidth: 36, color: theme.palette.text.primary }}
                >
                    {theme.palette.mode === 'dark' ? (
                        <ModeNightIcon />
                    ) : (
                        <WbSunnyIcon />
                    )}
                </ListItemIcon>

                <ListItemText>
                    <FormattedMessage id="modeSwitch.label" />
                </ListItemText>
            </ListItemButton>
        </Tooltip>
    );
}

export default ModeSwitch;
