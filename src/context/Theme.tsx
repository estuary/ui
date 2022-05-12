import {
    createTheme,
    PaletteOptions,
    SxProps,
    Theme,
    ThemeOptions,
    ThemeProvider as MUIThemeProvider,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { BaseComponentProps } from 'types';

// Colors
export const teal = {
    25: '#E6FFFF',
    50: '#CDFBFB',
    100: '#ABEDEE',
    200: '#8BE1E2',
    300: '#6DD4D5',
    400: '#4DBABC',
    500: '#32A0A3',
    600: '#1C8789',
    700: '#0C6E70',
    800: '#015556',
};

export const slate = {
    15: '#F6FAFF',
    25: '#EEF8FF',
    50: '#D8E9F5',
    100: '#ACC7DC',
    200: '#85A7C2',
    300: '#638AA9',
    400: '#466F8F',
    500: '#2E5676',
    600: '#1B3F5C',
    700: '#0D2B43',
    800: '#04192A',
};

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
// TODO: Balance the light mode color palette.
const lightMode: PaletteOptions = {
    background: {
        default: teal[800],
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
        main: teal[300],
        dark: teal[500],
    },
    secondary: {
        main: slate[50],
    },
    success: {
        main: successMain,
    },
    text: {
        primary: slate[15],
        secondary: teal[50],
    },
    tonalOffset,
    warning: {
        main: warningMain,
    },
};

const darkMode: PaletteOptions = {
    background: {
        default: slate[800],
    },
    contrastThreshold,
    mode: 'dark',
    primary: {
        main: teal[300],
        dark: teal[500],
    },
    secondary: {
        main: teal[100],
    },
    text: {
        primary: slate[15],
        secondary: slate[100],
    },
    tonalOffset,
};

export const zIndexIncrement = 5;
const buttonHoverIndex = zIndexIncrement;
const chipDeleteIndex = buttonHoverIndex + zIndexIncrement;

// Styles
export const tableBorderSx: SxProps<Theme> = {
    borderBottom: `1px solid ${slate[200]}`,
};

export const outlineSx: SxProps<Theme> = {
    border: `1px solid ${slate[200]}`,
};

// Theme
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
                        zIndex: buttonHoverIndex,
                    },
                    '& 	.MuiChip-deleteIcon': {
                        zIndex: chipDeleteIndex,
                    },
                },
            },
        },
        MuiButton: {
            defaultProps: {
                variant: 'contained',
                disableElevation: true,
                sx: {
                    borderRadius: 5,
                },
            },
        },
        MuiTableCell: {
            defaultProps: {
                sx: tableBorderSx,
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
            'Inter',
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

const ColorModeContext = React.createContext({
    toggleColorMode: () => {},
});

// TODO: Enable color mode toggling once light mode colors are refined.
const ThemeProvider = ({ children }: BaseComponentProps) => {
    // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const [mode, setMode] = React.useState<PaletteOptions>(darkMode);

    const toggler = React.useMemo(() => {
        return () => {
            setMode((prevMode: any) =>
                prevMode === lightMode ? darkMode : lightMode
            );
        };
    }, []);

    const generatedTheme = React.useMemo(() => {
        return createTheme({
            ...themeSettings,
            palette: mode,
        });
    }, [mode]);

    return (
        <ColorModeContext.Provider value={{ toggleColorMode: toggler }}>
            <MUIThemeProvider theme={generatedTheme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => React.useContext(ColorModeContext);

export default ThemeProvider;
