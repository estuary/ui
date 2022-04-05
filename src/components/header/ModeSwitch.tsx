import ModeNightIcon from '@mui/icons-material/ModeNight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { Box, IconButton, useTheme } from '@mui/material';
import { useColorMode } from 'context/Theme';

function ModeSwitch() {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Box
            sx={{
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.primary',
                borderRadius: 1,
                p: 3,
            }}
        >
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? (
                    <WbSunnyIcon />
                ) : (
                    <ModeNightIcon />
                )}
            </IconButton>
        </Box>
    );
}

export default ModeSwitch;
