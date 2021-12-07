import {
    createTheme,
    PaletteOptions,
    ThemeProvider,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/utils';
import PropTypes from 'prop-types';
import React from 'react';

ClassNameGenerator.configure((componentName) =>
    componentName.replace('Mui', 'Mui5')
); //TODO remove once JSONForms get updates

// Colors
const primary = '#97AFB9';
const secondary = '#4FD6FF';
const background = '#F7F7F7';

// Status Colors
const errorMain = '#f67375';
const warningMain = '#DD6A7A';
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

// Spacing
const spacing = 8;

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
    tonalOffset: 0.1,
};

const darkMode: PaletteOptions = {
    mode: 'dark',
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
                disableRipple: false, //Since they use ripple to show focus going to leave it on for now
            },
        },
        MuiButton: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiButtonGroup: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiCheckbox: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiFab: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiFormControl: {
            defaultProps: {
                margin: 'dense',
                size: 'small',
            },
        },
        MuiFormHelperText: {
            defaultProps: {
                margin: 'dense',
            },
        },
        MuiIconButton: {
            defaultProps: { size: 'small' },
        },
        MuiInputBase: {
            defaultProps: { margin: 'dense' },
        },
        MuiInputLabel: {
            defaultProps: { margin: 'dense' },
        },
        MuiRadio: {
            defaultProps: { size: 'small' },
        },
        MuiSwitch: {
            defaultProps: { size: 'small' },
        },
        MuiTextField: {
            defaultProps: {
                margin: 'dense',
                size: 'small',
            },
        },
        MuiList: {
            defaultProps: { dense: true },
        },
        MuiMenuItem: {
            defaultProps: { dense: true },
        },
        MuiTabs: {
            defaultProps: {
                indicatorColor: 'secondary',
            },
        },
        MuiTable: {
            defaultProps: { size: 'small' },
        },
    },
    shape: {
        borderRadius: 3,
    },
    spacing,
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
