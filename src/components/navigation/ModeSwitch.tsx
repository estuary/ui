import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';

// TODO: Enable color mode toggling once light mode colors are refined.
function ModeSwitch() {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Box sx={{ pt: 0.25, pb: 1 }}>
            <Tooltip title="Toggle Color Mode" placement="right-end">
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                    {theme.palette.mode === 'dark' ? (
                        <ModeNightIcon />
                    ) : (
                        <WbSunnyIcon />
                    )}
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export default ModeSwitch;
