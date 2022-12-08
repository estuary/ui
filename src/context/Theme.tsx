import {
    createTheme,
    PaletteOptions,
    SxProps,
    Theme,
    ThemeOptions,
    ThemeProvider as MUIThemeProvider,
    TypographyProps,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { useLocalStorage } from 'react-use';
import { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

// Navigation width
export enum NavWidths {
    MOBILE = 0,
    RAIL = 57,
    FULL = 225,
}

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
    '50_a': 'rgba(216, 233, 245, 1)',
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
const contrastThreshold = 5;
const tonalOffset = 0.1;

// Borders
// const borderWidth = 2;
// const borderColor = "rgba(0, 0, 0, 0.13)";

export const logoColors = {
    purple: '#5974ea',
    teal: '#75d4d5',
};

// Breakpoints
const xl = 1600;
const lg = 1440;
const md = 900;
const sm = 650;
const xs = 0;

// Color Palettes
// TODO: Balance the light mode color palette.
const lightMode: PaletteOptions = {
    background: {
        default: '#F5F6FA',
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

// Need to make the sticky header be on top
export const headerLinkIndex = zIndexIncrement * 30;

// Makes sure the hovering styling can be seen
const buttonHoverIndex = zIndexIncrement * 4;
// To make the delete in a multi select to work
const chipDeleteIndex = buttonHoverIndex + zIndexIncrement;
// JSONForms accordion is hardcoded to 20 so making this "1 higher"
const accordionButton = zIndexIncrement * 5;

// Styles

// TODO (optimization): Store the outline style as a detached configuration that
//   can be applied to the assortment of CSS border properties.
export const tableBorderSx: SxProps<Theme> = {
    borderBottom: `1px solid ${slate[200]}`,
};

export const tableAlternateRowsSx: SxProps<Theme> = {
    '& tr:nth-of-type(even)': {
        backgroundColor: (theme) => theme.palette.action.hover,
    },
};

// TODO (optimization): Replace instances of outlineSx with slateOutline.
export const slateOutline = `1px solid ${slate[200]}`;

export const outlineSx: SxProps<Theme> = {
    border: `1px solid ${slate[200]}`,
};

export const typographyTruncation: TypographyProps = {
    noWrap: true,
    sx: {
        minWidth: 0,
    },
};

// TODO (Colors) need to follow a pattern where all colors are in the theme file.
//      this is one way to handle the light/dark mode:
export const glassBkgWithBlur = {
    light: {
        background: 'white',
    },
    dark: {
        background: 'rgb(13, 43, 67)',
    },
};

export const glassBkgWithoutBlur = {
    light: {
        background: 'white',
        borderRadius: 5,
    },
    dark: {
        background: 'rgb(13, 43, 67)',
        borderRadius: 5,
    },
};

export const semiTransparentBackground = {
    light: 'rgba(216, 233, 245, 0.75)',
    dark: 'rgba(172, 199, 220, 0.12)',
};

export const semiTransparentBackgroundIntensified = {
    light: 'rgba(216, 233, 245, 1)',
    dark: 'rgba(172, 199, 220, 0.18)',
};

export const jsonFormsGroupHeaders = {
    light: slate[25],
    dark: 'transparent',
};

export const reflexSplitterBackground = {
    light: slate[25],
    dark: slate[200],
};

export const alternativeReflexContainerBackground = {
    light: 'white',
    dark: 'rgba(172, 199, 220, 0.05)',
};

export const alternativeDataGridHeader = {
    light: 'white',
    dark: 'transparent',
};

export const alertTextPrimary = {
    light: 'rgba(0, 0, 0, 0.8)',
    dark: 'rgb(255, 255, 255)',
};
export const alertBackground = {
    light: 'white',
    dark: semiTransparentBackgroundIntensified.dark,
};
export const connectorCardLogoBackground = 'rgba(172, 199, 220, 0.30)';

export const logDialogBackground = {
    light: slate[25],
    dark: slate[800],
};

export const secondaryButtonBackground = {
    light: slate[100],
    dark: slate[50],
};

export const secondaryButtonHoverBackground = {
    light: slate[200],
    dark: slate[100],
};

const expandedRowBgColor = {
    light: slate[50],
    dark: slate[800],
};
export const getEntityTableRowSx = (
    theme: Theme,
    detailsExpanded: boolean
): SxProps<Theme> => {
    return {
        background: detailsExpanded
            ? expandedRowBgColor[theme.palette.mode]
            : null,
        cursor: 'pointer',
    };
};

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

// Used to make buttons look like a normal(ish) link
export const LINK_BUTTON_STYLING: SxProps<Theme> = {
    'px': 1,
    'py': 0,
    'fontWeight': 500,
    'zIndex': headerLinkIndex,
    'textDecoration': 'underline',
    '&:hover, &:focus': {
        fontWeight: 700,
        textDecoration: 'underline',
    },
};

export const connectorImageBackgroundRadius = 5;
export const connectorImageBackgroundSx: SxProps<Theme> = {
    width: '100%',
    height: 125,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderRadius: connectorImageBackgroundRadius,
    background: connectorCardLogoBackground,
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
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    minWidth: sm,
                },
            },
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
                    '& .MuiChip-deleteIcon': {
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
            styleOverrides: {
                root: {
                    paddingLeft: 8,
                    paddingRight: 8,
                },
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
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const [mode, setMode] = useLocalStorage(
        LocalStorageKeys.COLOR_MODE,
        prefersDarkMode ? 'dark' : 'light'
    );

    const [palette, setPalette] = React.useState(
        mode === 'dark' ? darkMode : lightMode
    );

    const toggler = React.useMemo(() => {
        return () => {
            setMode(() => (palette.mode === 'light' ? 'dark' : 'light'));
        };
    }, [setMode, palette]);

    const generatedTheme = React.useMemo(() => {
        setPalette(mode === 'dark' ? darkMode : lightMode);

        return createTheme({
            ...themeSettings,
            palette,
            components: {
                ...themeSettings.components,
                MuiAccordion: {
                    defaultProps: {
                        sx: {
                            '& .MuiIconButton-root': {
                                zIndex: accordionButton,
                            },
                        },
                    },
                    styleOverrides: {
                        root: {
                            backgroundColor:
                                palette.mode === 'dark'
                                    ? 'transparent'
                                    : 'rgba(255, 255, 255, 0.6)',
                            boxShadow: 'none',
                            overflow: 'hidden',
                        },
                    },
                },
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor:
                                palette.mode === 'dark'
                                    ? slate[800]
                                    : slate[50],
                            boxShadow: 'none',
                            color: palette.text?.primary,
                        },
                    },
                },
            },
        });
    }, [setPalette, palette, mode]);

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
