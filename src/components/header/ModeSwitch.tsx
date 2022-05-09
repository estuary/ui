import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { Box, IconButton, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';

// TODO: Enable color mode toggling once light mode colors are refined.
function ModeSwitch() {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Box>
            <IconButton
                onClick={colorMode.toggleColorMode}
                color="inherit"
                disabled
            >
                {theme.palette.mode === 'dark' ? (
                    <ModeNightIcon />
                ) : (
                    <WbSunnyIcon />
                )}
            </IconButton>
        </Box>
    );
}

export default ModeSwitch;
