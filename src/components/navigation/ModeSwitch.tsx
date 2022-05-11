import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { IconButton, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';

// TODO: Enable color mode toggling once light mode colors are refined.
function ModeSwitch() {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
<<<<<<< HEAD
        // <Tooltip title="Toggle Color Mode" placement="right-end">
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
        // </Tooltip>
=======
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
>>>>>>> b2f2376... Correct layout adjustment
    );
}

export default ModeSwitch;
