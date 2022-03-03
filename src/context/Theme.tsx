import {
    createTheme,
    PaletteOptions,
    ThemeOptions,
    ThemeProvider,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';

// Colors
const primary = '#5660BD';
const secondary = '#3c5584';
const background = '#F7F7F7';

// Status Colors
const errorMain = '#f67375';
const warningMain = '#f5d75e';
const infoMain = '#4FD6FF';
const successMain = '#00c892';

// Color modifiers
const contrastThreshold = 4;
const tonalOffset = 0.1;

// Borders
// const borderWidth = 2;
// const borderColor = "rgba(0, 0, 0, 0.13)";

// Breakpoints
const xl = 1800;
const lg = 1500;
const md = 900;
const sm = 600;
const xs = 300;

// Color Palettes
const lightMode: PaletteOptions = {
    background: {
        default: background,
    },
    contrastThreshold,
    error: {
        main: errorMain,
    },
    info: {
        main: infoMain,
    },
    mode: 'light',
    primary: {
        main: primary,
    },
    secondary: {
        main: secondary,
    },
    success: {
        main: successMain,
    },
    tonalOffset,
    warning: {
        main: warningMain,
    },
};

const darkMode: PaletteOptions = {
    background: {
        default: '#363636',
    },
    contrastThreshold,
    mode: 'dark',
    tonalOffset,
};

const themeSettings = createTheme({
    breakpoints: {
        values: {
            lg,
            md,
            sm,
            xl,
            xs,
        },
    },
    components: {
        MuiBadge: {
            defaultProps: {
                color: 'info',
            },
        },
        MuiButtonBase: {
            defaultProps: {
                // based on React-Admin's solution
                //   https://github.com/marmelab/react-admin/blob/master/packages/ra-ui-materialui/src/defaultTheme.ts
                disableRipple: true,
                sx: {
                    '&.Mui-focusVisible::after, &:hover::after': {
                        backgroundColor: 'currentColor',
                        borderRadius: 'inherit',
                        content: '""',
                        display: 'block',
                        height: '100%',
                        opacity: 0.1,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '100%',
                    },
                },
            },
        },
        MuiTabs: {
            defaultProps: {
                indicatorColor: 'secondary',
            },
        },
    },
    shape: {
        borderRadius: 2,
    },
    typography: {
        fontFamily: [
            'Poppins',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'Ubuntu',
            'Cantarell',
            '"Helvetica Neue"',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
} as ThemeOptions);

const AppTheme: React.FC = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const generatedTheme = React.useMemo(() => {
        return createTheme({
            ...themeSettings,
            palette: prefersDarkMode ? darkMode : lightMode,
        });
    }, [prefersDarkMode]);

    return (
        <ThemeProvider theme={generatedTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default AppTheme;
