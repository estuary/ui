//TODO (UI / UX) - These icons are not final
import {
    Box,
    Collapse,
    IconButton,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';
import HeroImageAndDescription from 'components/home/hero';
import { useShowDashboardWelcome } from 'context/DashboardWelcome';
import { defaultOutline, semiTransparentBackground } from 'context/Theme';
import { Plus, Xmark } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

export default function Welcome() {
    const theme = useTheme();

    const { welcomeShown, setWelcomeShown } = useShowDashboardWelcome();

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
                    <FormattedMessage id="home.main.header" />
                </Typography>

                <IconButton
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
