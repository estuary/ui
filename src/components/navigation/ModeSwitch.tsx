import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';

// TODO: Enable color mode toggling once light mode colors are refined.
function ModeSwitch() {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Tooltip title="Toggle Color Mode" placement="right-end">
            <IconButton
                color="inherit"
                disabled
                onClick={colorMode.toggleColorMode}
            >
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
