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

export const indigo = {
    50: '#D6DFFF',
    100: '#B8C6F9',
    200: '#97AAEC',
    300: '#798FDF',
    400: '#5072EB',
    500: '#3F59B8',
    600: '#27419F',
    700: '#132C85',
    800: '#051B6C',
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
export type SemanticColor = '#40B763' | '#F5D75E' | '#CA3B55' | '#4FD6FF';

export const successMain: SemanticColor = '#40B763';
export const warningMain: SemanticColor = '#F5D75E';
export const errorMain: SemanticColor = '#CA3B55';
export const infoMain: SemanticColor = '#4FD6FF';

// Color modifiers
const contrastThreshold = 4;
const tonalOffset = 0.1;

// Borders
// const borderWidth = 2;
// const borderColor = "rgba(0, 0, 0, 0.13)";

// Breakpoints
const xl = 1800;
const lg = 1200;
const md = 900;
const sm = 650;
const xs = 0;

// Color Palettes
// TODO: Balance the light mode color palette.
const lightMode: PaletteOptions = {
    background: {
        default: slate[50],
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
        main: indigo[400],
        dark: indigo[500],
    },
    secondary: {
        main: indigo[600],
    },
    success: {
        main: successMain,
    },
    text: {
        primary: slate[800],
        secondary: indigo[800],
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

// TODO (zindex) We should make a helper or something to help manage zindex.
//  It doesn't come up often but happens enough it would be nice to handle better.
export const zIndexIncrement = 5;
export const headerLinkIndex = zIndexIncrement + zIndexIncrement;
export const stickyHeaderIndex =
    zIndexIncrement + zIndexIncrement + zIndexIncrement;
const buttonHoverIndex = zIndexIncrement;
const chipDeleteIndex = buttonHoverIndex + zIndexIncrement;

// Styles
export const tableBorderSx: SxProps<Theme> = {
    borderBottom: `1px solid ${slate[200]}`,
};

export const outlineSx: SxProps<Theme> = {
    border: `1px solid ${slate[200]}`,
};

export const darkNavPaperBackground = {
    background:
        'linear-gradient(179.6deg, rgba(99, 138, 169, 0.24) 0%, rgba(13, 43, 67, 0.2) 76.56%, rgba(13, 43, 67, 0.1) 100%)',
    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
    borderRadius: '0px 10px 10px 0px',
    backdropFilter: 'blur(20px)',
};

export const lightNavPaperBackground = {
    background: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0px 4px 24px -1px rgba(4, 25, 42, 0.2)',
    backdropFilter: 'blur(20px)',
    borderRadius: '0px 10px 10px 0px',
};

export const darkPagePaperBackground = {
    background:
        'linear-gradient(160deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(70, 111, 143, 0.16) 40%)',
    boxShadow: '0px 4px 30px -1px rgba(0, 0, 0, 0.25)',
    borderRadius: 5,
    backdropFilter: 'blur(20px)',
};

export const lightPagePaperBackground = {
    background: 'rgba(255, 255, 255, 0.4)',
    boxShadow: '0px 4px 24px -1px rgba(4, 25, 42, 0.2)',
    backdropFilter: 'blur(20px)',
    borderRadius: 5,
};

export const darkDialogPaperBackground = {
    background:
        'linear-gradient(159.03deg, rgba(172, 199, 220, 0.18) 2.23%, rgba(172, 199, 220, 0.12) 40.69%)',
    boxShadow: '0px 4px 24px -1px rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
};

// TODO (theme) Figure out how to make these composable
export const truncateTextSx: SxProps<Theme> = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

const baseBackground = {
    styleOverrides: {
        root: {
            backgroundColor: 'transparent',
        },
    },
};

export const jsonFormsPadding: SxProps<Theme> = {
    '& > div > .MuiGrid-container.MuiGrid-root': {
        padding: 1,
    },
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
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    minWidth: sm,
                },
            },
        },
        MuiAppBar: {
            ...baseBackground,
        },
        MuiAccordion: {
            ...baseBackground,
        },
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
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
        MuiTableCell: {
            defaultProps: {
                sx: tableBorderSx,
            },
        },
        MuiTabs: {
            ...baseBackground,
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
            components: {
                ...themeSettings.components,
                MuiAccordion: {
                    styleOverrides: {
                        root: {
                            backgroundColor:
                                mode.mode === 'dark'
                                    ? 'transparent'
                                    : 'rgba(255, 255, 255, 0.6)',
                            boxShadow: '0px 4px 10px -1px rgba(4, 25, 42, 0.2)',
                            borderRadius: 10,
                            overflow: 'hidden',
                        },
                    },
                },

                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor:
                                mode.mode === 'dark'
                                    ? 'transparent'
                                    : 'rgba(216, 233, 245, 0.4)',
                            boxShadow: 'none',
                            color: mode.text?.primary,
                        },
                    },
                },
            },
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
