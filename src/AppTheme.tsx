import {
    createTheme,
    PaletteOptions,
    ThemeOptions,
    ThemeProvider,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import PropTypes from 'prop-types';
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
    mode: 'light',
    primary: {
        main: primary,
    },
    secondary: {
        main: secondary,
    },
    error: {
        main: errorMain,
    },
    warning: {
        main: warningMain,
    },
    info: {
        main: infoMain,
    },
    success: {
        main: successMain,
    },
    background: {
        default: background,
    },
    contrastThreshold: contrastThreshold,
    tonalOffset: tonalOffset,
};

const darkMode: PaletteOptions = {
    mode: 'dark',
    background: {
        default: '#363636',
    },
    contrastThreshold: contrastThreshold,
    tonalOffset: tonalOffset,
};

const themeSettings = createTheme({
    breakpoints: {
        values: {
            xl,
            lg,
            md,
            sm,
            xs,
        },
    },
    components: {
        MuiAppBar: {},
        MuiButtonBase: {
            defaultProps: {
                // based on React-Admin's solution
                //   https://github.com/marmelab/react-admin/blob/master/packages/ra-ui-materialui/src/defaultTheme.ts
                disableRipple: true,
                sx: {
                    '&:hover:active::after': {
                        content: '""',
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'currentColor',
                        opacity: 0.1,
                        borderRadius: 'inherit',
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

const AppThemePropTypes = {
    children: PropTypes.element.isRequired,
};
type AppThemeProps = PropTypes.InferProps<typeof AppThemePropTypes>;

export default function AppTheme(props: AppThemeProps) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const generatedTheme = React.useMemo(() => {
        themeSettings.components!.MuiAppBar!.defaultProps = {
            sx: {
                backgroundColor: prefersDarkMode ? '#121212' : '#97AFB9',
            },
        };

        return createTheme({
            ...themeSettings,
            palette: prefersDarkMode ? darkMode : lightMode,
        });
    }, [prefersDarkMode]);

    return (
        <ThemeProvider theme={generatedTheme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
