import {
    createTheme,
    PaletteOptions,
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
    tonalOffset: 0.3,
};

const darkMode: PaletteOptions = {
    mode: 'dark',
    background: {
        default: '#363636',
    },
    tonalOffset: 0.3,
};

export const themeSettings = createTheme({
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
        MuiButtonBase: {
            defaultProps: {
                disableRipple: true,
                sx: {
                    '&:hover:active::after': {
                        // based on React-Admin's solution
                        //   https://github.com/marmelab/react-admin/blob/master/packages/ra-ui-materialui/src/defaultTheme.ts
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
});

const AppThemePropTypes = {
    children: PropTypes.element.isRequired,
};
type AppThemeProps = PropTypes.InferProps<typeof AppThemePropTypes>;

export default function AppTheme(props: AppThemeProps) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const generatedTheme = React.useMemo(
        () =>
            createTheme({
                ...themeSettings,
                palette: prefersDarkMode ? darkMode : lightMode,
                components: {
                    MuiAppBar: {
                        defaultProps: {
                            sx: {
                                backgroundColor: prefersDarkMode
                                    ? '#121212'
                                    : '#97AFB9',
                            },
                        },
                    },
                },
            }),
        [prefersDarkMode]
    );

    return (
        <ThemeProvider theme={generatedTheme}>
            <CssBaseline />
            {props.children}
        </ThemeProvider>
    );
}
