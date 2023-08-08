import {
    ThemeProvider as MUIThemeProvider,
    PaletteOptions,
    SxProps,
    Theme,
    ThemeOptions,
    TypographyProps,
    createTheme,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import React from 'react';
import { useLocalStorage } from 'react-use';
import { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

// The code block commented out directly below is how the typography variants can be extended
// or existing variants disabled.
//
// declare module '@mui/material/styles' {
//     interface TypographyVariants {
//         sampleProp: React.CSSProperties;
//     }

//     // allow configuration using `createTheme`
//     interface TypographyVariantsOptions {
//         sampleProp?: React.CSSProperties;
//     }
// }

// // Update the Typography's variant prop options
// declare module '@mui/material/Typography' {
//     interface TypographyPropsVariantOverrides {
//         sampleProp: true;
//     }
// }

// Navigation Width
export enum NavWidths {
    MOBILE = 0,
    RAIL = 48,
    FULL = 200,
}

// Colors
export const sample_blue = {
    100: '#DCE6FE',
    200: '#BACDFD',
    300: '#96B0F9',
    400: '#7A97F3',
    500: '#5072EB',
    600: '#3A56CA',
    700: '#283EA9',
    800: '#192A88',
    900: '#0F1B70',
};

export const sample_grey = {
    100: '#F7F9FC',
    200: '#F0F4F9',
    300: '#E1E9F4',
    400: '#D3DEEE',
    500: '#C4D3E9',

    600: '#1C2E4A',
    700: '#16253B',
    800: '#111C2C',
    900: '#0B131E',
};

// Status Colors
export type SemanticColor =
    | '#40B763'
    | '#2A7942'
    | '#F5D75E'
    | '#CA3B55'
    | '#4FD6FF';

export const successMain: SemanticColor = '#40B763';
export const successDark: SemanticColor = '#2A7942';
export const warningMain: SemanticColor = '#F5D75E';
export const errorMain: SemanticColor = '#CA3B55';
export const infoMain: SemanticColor = '#4FD6FF';

// Color modifiers
const contrastThreshold = 5;
const tonalOffset = 0.1;

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
        default: sample_grey[100],
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
        main: sample_blue[600],
    },
    secondary: {
        main: sample_blue[800],
    },
    success: {
        main: successMain,
        dark: successDark,
    },
    text: {
        primary: sample_grey[900],
        secondary: sample_blue[800],
    },
    tonalOffset,
};

const darkMode: PaletteOptions = {
    background: {
        default: sample_grey[900],
    },
    contrastThreshold,
    mode: 'dark',
    primary: {
        main: sample_blue[200],
    },
    secondary: {
        main: sample_blue[400],
    },
    text: {
        primary: sample_grey[300],
        secondary: sample_grey[500],
    },
    tonalOffset,
};

// TODO (zindex) We should make a helper or something to help manage zindex.
//  It doesn't come up often but happens enough it would be nice to handle better.
export const zIndexIncrement = 5;

// Makes sure the hovering styling can be seen
const buttonHoverIndex = zIndexIncrement * 4;

// To make the delete in a multi select to work
const chipDeleteIndex = buttonHoverIndex + zIndexIncrement;

// To make the sortable chip list work
export const chipDraggableIndex = buttonHoverIndex + zIndexIncrement;

// JSONForms accordion is hardcoded to 20 so making this "1 higher"
const accordionButton = zIndexIncrement * 5;

// Need to make the sticky header be on top
export const headerLinkIndex = zIndexIncrement * 30;

// Popper component z index must be greater than 100, the z index of the reflex splitter component.
export const popperIndex = zIndexIncrement * 500;

// Borders

// Light is an RGB translation of #0B131E; Dark is an RGB translation of #F7F9FC.
export const defaultOutline = {
    light: `1px solid rgba(11, 19, 30, 0.12)`,
    dark: `1px solid rgba(247, 249, 252, 0.12)`,
};

export const defaultOutlineColor = {
    light: `rgba(11, 19, 30, 0.12)`,
    dark: `rgba(247, 249, 252, 0.12)`,
};

// Light is an RGB translation of #0B131E; Dark is an RGB translation of #F7F9FC.
export const intensifiedOutline = {
    light: `1px solid rgba(11, 19, 30, 0.25)`,
    dark: `1px solid rgba(247, 249, 252, 0.25)`,
};

export const intensifiedOutlineThick = {
    light: `2px solid rgba(11, 19, 30, 0.25)`,
    dark: `2px solid rgba(247, 249, 252, 0.25)`,
};

// Light is an RGB translation of #3A56CA; Dark is an RGB translation of #BACDFD.
export const primaryColoredOutline = {
    light: `1px solid rgba(58, 86, 202, 0.5)`,
    dark: `1px solid rgba(186, 205, 253, 0.5)`,
};

export const primaryColoredOutline_disabled = {
    light: `1px solid rgba(58, 86, 202, 0.12)`,
    dark: `1px solid rgba(186, 205, 253, 0.12)`,
};

// Styles

export const tableAlternateRowsSx: SxProps<Theme> = {
    '& tr:nth-of-type(even)': {
        backgroundColor: (theme) => theme.palette.action.hover,
    },
};

export const typographyTruncation: TypographyProps = {
    noWrap: true,
    sx: {
        minWidth: 0,
    },
};

export const draggableChipIconSx: SxProps<Theme> = {
    '& .MuiChip-icon': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        cursor: 'grab',
        ml: 0,
        zIndex: chipDraggableIndex,
    },
};

export const defaultBoxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

// TODO (Colors) need to follow a pattern where all colors are in the theme file.
//      this is one way to handle the light/dark mode:

export const paperBackground = {
    light: 'white',
    dark: sample_grey[800],
};

export const paperBackgroundImage = {
    light: 'none',
    dark: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
};

// RGB translation of #F7F9FC.
export const semiTransparentBackground = {
    light: 'white',
    dark: 'rgba(247, 249, 252, 0.05)',
};

// Light is an RGB translation of #0B131E; Dark is an RGB translation of #F7F9FC.
export const semiTransparentBackgroundIntensified = {
    light: 'rgba(11, 19, 30, 0.02)',
    dark: 'rgba(247, 249, 252, 0.08)',
};

export const jsonFormsGroupHeaders = {
    light: 'white',
    dark: 'transparent',
};

export const reflexSplitterBackground = {
    light: 'white',
    dark: 'rgba(247, 249, 252, 0.30)',
};

// RGB translation of #F7F9FC.
export const alternativeReflexContainerBackground = {
    light: 'white',
    dark: 'rgba(247, 249, 252, 0.05)',
};

export const alternativeDataGridHeader = {
    light: 'white',
    dark: 'transparent',
};

export const alertTextPrimary = {
    light: 'rgba(0, 0, 0, 0.8)',
    dark: 'rgb(255, 255, 255)',
};
export const alertBackground = paperBackground;

export const monacoEditorHeaderBackground = {
    light: 'white',
    dark: '#121212',
};

export const monacoEditorWidgetBackground = {
    light: 'white',
    dark: '#1e1e1e',
};

export const monacoEditorComponentBackground = {
    light: 'vs',
    dark: 'vs-dark',
};

// RGB translation of #F7F9FC.
export const codeBackground = {
    light: sample_grey[200],
    dark: 'rgba(247, 249, 252, 0.05)',
};

const expandedRowBgColor = {
    light: sample_grey[100],
    dark: 'rgba(247, 249, 252, 0.05)',
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

// Light is an RGB translation of #E1E9F4.
export const detailsPanelBgColor = {
    light: 'rgba(225, 233, 244, 0.70)',
    dark: sample_grey[900],
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

export const underlineTextSx: SxProps<Theme> = {
    'textDecoration': 'underline',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
};

// Used to make buttons look like a normal(ish) link
export const linkButtonSx: SxProps<Theme> = {
    ...underlineTextSx,
    px: 1,
    py: 0,
    fontWeight: 500,
    zIndex: headerLinkIndex,
};

// Light is an RGB translation of #E1E9F4; Light is an RGB translation of #F7F9FC.
export const connectorCardLogoBackground = {
    light: 'rgba(225, 233, 244, 0.30)',
    dark: 'rgba(247, 249, 252, 0.08)',
};

export const connectorImageBackgroundRadius = 3;
export const connectorImageBackgroundSx: SxProps<Theme> = {
    width: '100%',
    height: 125,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderRadius: connectorImageBackgroundRadius,
    background: (theme) => connectorCardLogoBackground[theme.palette.mode],
};

// This is the hex code for the monaco editor background in dark mode.
export const shardTableRow = {
    light: sample_grey[100],
    dark: '#252526',
};

export const alternateConnectorImageBackgroundSx: SxProps<Theme> = {
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: connectorImageBackgroundRadius,
    background: (theme) => connectorCardLogoBackground[theme.palette.mode],
};

export const autoCompleteListPadding = 8;

export const dataGridListStyling: SxProps<Theme> = {
    'borderRadius': 0,
    'borderBottom': 'none',
    '& .MuiDataGrid-row ': {
        cursor: 'pointer',
    },
    '& .MuiDataGrid-cell': {
        borderBottom: (theme) => defaultOutline[theme.palette.mode],
    },
    '& .MuiDataGrid-columnSeparator': {
        display: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
        borderBottom: (theme) => defaultOutline[theme.palette.mode],
        bgcolor: (theme) => alternativeDataGridHeader[theme.palette.mode],
    },
    '& .MuiDataGrid-columnHeader:hover': {
        '& .MuiDataGrid-columnHeaderTitleContainerContent': {
            mr: 0.5,
        },
        '& .MuiDataGrid-menuIcon': {
            width: '2rem',
        },
    },
    '& .MuiDataGrid-columnHeaderTitleContainerContent': {
        width: '100%',
        justifyContent: 'space-between',
        mr: 4.5,
    },
};

export const doubleElevationHoverBackground = {
    light: '#F5F5F5',
    dark: '#3A4350',
};

const tableCellBackground = {
    light: 'white',
    dark: '#293341',
};

export const getStickyTableCell = (headerParent?: boolean): SxProps<Theme> => {
    return {
        position: 'sticky',
        left: 0,
        background: (theme) =>
            headerParent
                ? theme.palette.background.default
                : tableCellBackground[theme.palette.mode],
        borderRight: (theme) =>
            `3px solid ${defaultOutlineColor[theme.palette.mode]}`,
        zIndex: zIndexIncrement,
    };
};

// Light is an RGB translation of #3A56CA; Dark is an RGB translation of #BACDFD.
export const outlinedButtonBackground = {
    light: `rgba(58, 86, 202, 0.12)`,
    dark: `rgba(186, 205, 253, 0.12)`,
};

export const outlinedButtonBackground_disabled = {
    light: `rgba(58, 86, 202, 0.05)`,
    dark: `rgba(186, 205, 253, 0.05)`,
};

export const disabledButtonText_primary = {
    light: `rgba(58, 86, 202, 0.26)`,
    dark: `rgba(186, 205, 253, 0.26)`,
};

export const disabledButtonText = {
    light: 'rgba(0, 0, 0, 0.26)',
    dark: 'rgba(255, 255, 255, 0.3)',
};

// TODO (echarts) need to make a color service or something to
//  generate a proper ECharts theme. These two colors are taken
//  from ECharts default colors they apply in order
export const eChartsColors = ['#5470C6', '#91CC75'];

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
                    borderRadius: 6,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                'body': {
                    minWidth: sm,
                },
                'body.loginPage': {
                    minWidth: xs,
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
                    'fontSize': 14,
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
                    fontSize: 14,
                    borderRadius: 4,
                },
            },
        },
        MuiCheckbox: {
            defaultProps: {
                icon: <Square style={{ fontSize: 14 }} />,
                checkedIcon: <CheckSquare style={{ fontSize: 14 }} />,
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
        body1: {
            fontSize: 14,
        },
        button: {
            fontSize: 14,
        },
    },
} as ThemeOptions);

const ColorModeContext = React.createContext<{
    toggleColorMode: () => void;
    colorMode: string | undefined;
}>({
    toggleColorMode: () => {},
    colorMode: undefined,
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
                                    : 'white',
                            boxShadow: 'none',
                            overflow: 'hidden',
                        },
                    },
                },
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            background:
                                palette.mode === 'dark'
                                    ? sample_grey[800]
                                    : 'white',
                            boxShadow: 'none',
                            color: palette.text?.primary,
                        },
                    },
                },
                MuiDialog: {
                    styleOverrides: {
                        paper: {
                            background:
                                paperBackground[
                                    palette.mode === 'dark' ? 'dark' : 'light'
                                ],
                            borderRadius: 6,
                        },
                    },
                },
                MuiTableCell: {
                    styleOverrides: {
                        root: {
                            paddingLeft: 8,
                            paddingRight: 8,
                            fontSize: 14,
                            borderBottom:
                                defaultOutline[
                                    palette.mode === 'dark' ? 'dark' : 'light'
                                ],
                        },
                    },
                },
            },
        });
    }, [setPalette, palette, mode]);

    return (
        <ColorModeContext.Provider
            value={{ toggleColorMode: toggler, colorMode: mode }}
        >
            <MUIThemeProvider theme={generatedTheme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => React.useContext(ColorModeContext);

export default ThemeProvider;
