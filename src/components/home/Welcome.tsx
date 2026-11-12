//TODO (UI / UX) - These icons are not final
import {
    Box,
    Collapse,
    IconButton,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';

import { Plus, Xmark } from 'iconoir-react';
import { useLeaf, withBranch } from 'react-semantic-tree';

import HeroImageAndDescription from 'src/components/home/hero';
import { useShowDashboardWelcome } from 'src/context/DashboardWelcome';
import { defaultOutline, semiTransparentBackground } from 'src/context/Theme';

function Welcome() {
    const theme = useTheme();

    const { welcomeShown, setWelcomeShown } = useShowDashboardWelcome();
    const { ref: toggleWelcomeRef } = useLeaf(
        welcomeShown ? 'Collapse' : 'Expand'
    );

    return (
        <Box
            sx={{
                background: semiTransparentBackground[theme.palette.mode],
                border: defaultOutline[theme.palette.mode],
                borderRadius: 3,
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    justifyContent: welcomeShown ? 'center' : 'flex-start',
                    px: 2,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{ fontSize: welcomeShown ? 24 : 18 }}
                >
                    Welcome to Estuary!
                </Typography>

                <IconButton
                    ref={toggleWelcomeRef}
                    onClick={() => setWelcomeShown(!welcomeShown)}
                    style={{ position: 'absolute', top: 14, right: 8 }}
                >
                    {welcomeShown ? (
                        <Xmark style={{ color: theme.palette.text.primary }} />
                    ) : (
                        <Plus style={{ color: theme.palette.text.primary }} />
                    )}
                </IconButton>
            </Toolbar>

            <Collapse in={welcomeShown}>
                <HeroImageAndDescription />
            </Collapse>
        </Box>
    );
}

export default withBranch('Welcome Card')(Welcome);
