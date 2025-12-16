import type { ThemeKeys } from '@microlink/react-json-view';
import type {
    AlertColor,
    PaletteOptions,
    SxProps,
    Theme,
    ThemeOptions,
    TypographyProps,
} from '@mui/material';
import type { BaseComponentProps } from 'src/types';

import React from 'react';

import {
    createTheme,
    ThemeProvider as MUIThemeProvider,
    useMediaQuery,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import { Check, Copy, Square, WarningCircle, XmarkCircle } from 'iconoir-react';
import { useLocalStorage } from 'react-use';

import CheckSquare from 'src/icons/CheckSquare';
import { DEFAULT_TOOLBAR_HEIGHT } from 'src/utils/editor-utils';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

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

declare module '@mui/material/styles' {
    interface PaletteColor {
        alpha_05?: string;
        alpha_12?: string;
        alpha_26?: string;
        alpha_50?: string;
    }

    interface SimplePaletteColorOptions {
        alpha_05?: string;
        alpha_12?: string;
        alpha_26?: string;
        alpha_50?: string;
    }
}

declare module '@mui/material/styles' {
    interface TypographyVariants {
        formSectionHeader: React.CSSProperties;
    }

    // allow configuration using `createTheme`
    interface TypographyVariantsOptions {
        formSectionHeader?: React.CSSProperties;
    }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        formSectionHeader: true;
    }
}

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

const rgbTranslations = {
    dark: {
        error: {
            main: '228, 89, 114',
        },
        info: {
            main: '41, 182, 246',
        },
        primary: {
            main: '186, 205, 253',
        },
        secondary: {
            main: '122, 151, 243',
        },
        success: {
            main: '64, 183, 99',
        },
        warning: {
            main: '245, 124, 0',
        },
    },
    light: {
        error: {
            main: '202, 59, 85',
        },
        info: {
            dark: '8, 114, 147',
            main: '79, 214, 255',
        },
        primary: {
            main: '58, 86, 202',
        },
        secondary: {
            main: '25, 42, 136',
        },
        success: {
            dark: '42, 121, 66',
        },
        warning: {
            dark: '184, 84, 3',
            main: '237, 108, 2',
        },
    },
};

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
        alpha_05: `rgba(${rgbTranslations.light.error.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.error.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.error.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.error.main}, 0.50)`,
        main: errorMain,
    },
    info: {
        alpha_05: `rgba(${rgbTranslations.light.info.dark}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.info.dark}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.info.dark}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.info.dark}, 0.50)`,
        main: infoMain,
        dark: '#087293',
    },
    mode: 'light',
    primary: {
        alpha_05: `rgba(${rgbTranslations.light.primary.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.primary.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.primary.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.primary.main}, 0.50)`,
        main: sample_blue[600],
    },
    secondary: {
        alpha_05: `rgba(${rgbTranslations.light.secondary.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.secondary.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.secondary.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.secondary.main}, 0.50)`,
        main: sample_blue[800],
    },
    success: {
        alpha_05: `rgba(${rgbTranslations.light.success.dark}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.success.dark}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.success.dark}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.success.dark}, 0.50)`,
        main: successMain,
        dark: successDark,
    },
    text: {
        primary: sample_grey[900],
        secondary: sample_blue[800],
    },
    tonalOffset,
    warning: {
        alpha_05: `rgba(${rgbTranslations.light.warning.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.light.warning.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.light.warning.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.light.warning.main}, 0.50)`,
        main: '#ED6C02',
    },
};

const darkMode: PaletteOptions = {
    background: {
        default: sample_grey[900],
    },
    contrastThreshold,
    mode: 'dark',
    error: {
        alpha_05: `rgba(${rgbTranslations.dark.error.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.error.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.error.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.error.main}, 0.50)`,
        main: '#E45972',
    },
    info: {
        alpha_05: `rgba(${rgbTranslations.dark.info.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.info.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.info.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.info.main}, 0.50)`,
        main: '#29B6F6',
    },
    primary: {
        alpha_05: `rgba(${rgbTranslations.dark.primary.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.primary.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.primary.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.primary.main}, 0.50)`,
        main: sample_blue[200],
    },
    secondary: {
        alpha_05: `rgba(${rgbTranslations.dark.secondary.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.secondary.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.secondary.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.secondary.main}, 0.50)`,
        main: sample_blue[400],
    },
    success: {
        alpha_05: `rgba(${rgbTranslations.dark.success.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.success.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.success.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.success.main}, 0.50)`,
        main: successMain,
    },
    text: {
        primary: sample_grey[300],
        secondary: sample_grey[500],
    },
    tonalOffset,
    warning: {
        alpha_05: `rgba(${rgbTranslations.dark.warning.main}, 0.05)`,
        alpha_12: `rgba(${rgbTranslations.dark.warning.main}, 0.12)`,
        alpha_26: `rgba(${rgbTranslations.dark.warning.main}, 0.26)`,
        alpha_50: `rgba(${rgbTranslations.dark.warning.main}, 0.50)`,
        main: '#F57C00',
    },
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

export const defaultOutline_hovered = {
    light: `1px solid rgba(11, 19, 30, 0.6)`,
    dark: `1px solid rgba(247, 249, 252, 0.6)`,
};

export const defaultOutlineColor = {
    light: `rgba(11, 19, 30, 0.12)`,
    dark: `rgba(247, 249, 252, 0.12)`,
};

export const defaultOutlineColor_hovered = {
    light: `rgba(11, 19, 30, 0.6)`,
    dark: `rgba(247, 249, 252, 0.6)`,
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

export const jsonViewTheme: {
    light: ThemeKeys;
    dark: ThemeKeys;
} = {
    light: `bright:inverted`,
    dark: `bright`,
};

// Based on the colors in the theme above
export const jsonObjectPreview_key = {
    light: `rgb(26, 25, 26)`,
    dark: `rgb(255, 255, 255)`,
};
export const jsonObjectPreview_value = {
    light: `rgb(246, 103, 30)`,
    dark: `rgb(252, 109, 36)`,
};

// Styles
// TODO (styling) - we use this styling on non-cards we should probably rename this
//  and use in other places
export const cardHeaderSx: SxProps<Theme> = {
    fontSize: 16,
    fontWeight: 300,
};

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

export const editorToolBarSx: SxProps<Theme> = {
    minHeight: DEFAULT_TOOLBAR_HEIGHT,
    py: 0.5,
    px: 1,
};

export const hiddenButAccessibleInput: SxProps<Theme> = {
    position: 'fixed',
    opacity: 0,
    pointerEvents: 'none',
};

export const hiddenButAccessibleRadio: SxProps<Theme> = {
    '& .MuiRadio-root, & .MuiRadio-root input': {
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
    },
};

export const defaultBoxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

export const opaqueLightModeBorder = {
    light: `1px solid rgba(255, 255, 255, 0.8)`,
    dark: undefined,
};

export const opaqueLightModeBackground = {
    light: 'rgba(255, 255, 255, 0.70)',
    dark: 'rgba(247, 249, 252, 0.05)',
};

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

export const semiTransparentBackground_oneLayerElevated = {
    light: 'white',
    dark: '#1D2837',
};

// Light is an RGB translation of #0B131E; Dark is an RGB translation of #F7F9FC.
export const semiTransparentBackgroundIntensified = {
    light: 'rgba(11, 19, 30, 0.02)',
    dark: 'rgba(247, 249, 252, 0.08)',
};

// RGB translation of #C2CDFF.
export const semiTransparentBackground_blue = {
    light: '#F4F6FF',
    dark: 'rgba(194, 205, 255, 0.12)',
};
export const semiTransparentBackground_blue_nesting = {
    light: '#d8dcf2',
    dark: undefined,
};

// RGB translation of #BAEDF2.
export const semiTransparentBackground_teal = {
    light: '#EFFBFC',
    dark: 'rgba(186, 237, 242, 0.12)',
};

export const semiTransparentBackground_teal_nesting = {
    light: '#d4eae8',
    dark: undefined,
};

// RGB translation of #D6C2FF.
export const semiTransparentBackground_purple = {
    light: '#F7F3FF',
    dark: 'rgba(214, 194, 255, 0.12)',
};
export const semiTransparentBackground_purple_nesting = {
    light: '#ddd1f6',
    dark: undefined,
};

export const primaryColoredBackground_hovered = {
    light: '#3149AB',
    dark: '#9EAED7',
};

export const textLoadingColor = {
    light: 'rgba(11, 19, 30, 0.4)',
    dark: 'rgba(247, 249, 252, 0.4)',
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

export const alertColorsReversed: {
    [k in AlertColor]: { light: string; dark: string };
} = {
    success: { light: 'success.dark', dark: 'success.light' },
    info: { light: 'info.dark', dark: 'info.light' },
    warning: { light: 'warning.dark', dark: 'warning.light' },
    error: { light: 'error.dark', dark: 'error.light' },
};

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
    disabled?: boolean
): SxProps<Theme> => {
    return {
        background: disabled ? expandedRowBgColor[theme.palette.mode] : null,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.75 : undefined,
    };
};

type TransientButtonState = 'success' | undefined;
export const getButtonIcon = (
    theme: Theme,
    buttonState: TransientButtonState
): React.ReactNode => {
    switch (buttonState) {
        case 'success':
            return <Check style={{ color: theme.palette.success.main }} />;
        default:
            return <Copy style={{ color: theme.palette.primary.main }} />;
    }
};

// Light is an RGB translation of #E1E9F4.
export const detailsPanelBgColor = {
    light: 'rgba(225, 233, 244, 0.70)',
    dark: sample_grey[900],
};

// TODO (entity-status): Generalize the name of shardStatusDefaultColor.
export const shardStatusDefaultColor = {
    light: '#C4D3E9',
    dark: '#E1E9F4',
};

export const tableRowActive__Background = {
    light: 'rgba(225, 244, 225, 0.5)', // '#E1E9F4' used hue 120 at https://www.w3schools.com/colors/colors_picker.asp?color=e1e9f4
    dark: 'rgba(11, 30, 11, 0.7)', // '#0B131E' used hue 120 at https://www.w3schools.com/colors/colors_picker.asp?color=0B131E
    //  not sure which dark we want to use yet
    // dark: 'rgba(195, 233, 195, 0.7)', // '#C4D3E9' used hue 120 at https://www.w3schools.com/colors/colors_picker.asp?color=c4d3e9
};

export const tableRowActive_Finished__Background = {
    light: 'rgba(225, 233, 244, 0.5)',
    dark: 'rgba(196, 211, 233, 0.7)',
};

export const diminishedTextColor = {
    light: '#54585E',
    dark: '#B6BCC4',
};

// RGB translation of #F7F9FC.
export const menuBackgroundColor = {
    light: '#F0F4F9',
    dark: 'rgba(247, 249, 252, 0.05)',
};

export const entityHeaderButtonSx: SxProps<Theme> = { ml: 1 };

export const truncateTextSx: SxProps<Theme> = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

export const flexGrowToSiblingsSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'stretch',
    justifyItems: 'stretch',
    flexGrow: 1,
};

const baseBackground = {
    styleOverrides: {
        root: {
            backgroundColor: 'transparent',
        },
    },
};

export const jsonFormsPadding: SxProps<Theme> = {
    // Handles inputs on the first layer
    '& > .MuiGrid-root > .MuiGrid-root ': {
        marginBottom: 1,
    },
    // Handles inputs that are nested
    '& .MuiAccordionDetails-root > .MuiGrid-root > .MuiGrid-root': {
        marginBottom: 1,
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

export const dataGridEntireCellButtonStyling: SxProps<Theme> = {
    borderRadius: 0,
    justifyContent: 'center',
    height: '100%',
    margin: 0,
    width: '100%',
};

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
    '& .MuiDataGrid-columnHeaderTitleContainerContent': {
        height: '100%',
        width: '100%',
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

// Sticky headers mess with how the header color is set because it is coloring the
//  row _behind_. This means we cannot do something simple like setting a bgcolor
//  to transparent. Light mode will look normal like there is no heading but in darkmode
//  there will be some color there. Given how darkmode colors stacks this is a fair trade-off
export const getTableHeaderWithoutHeaderColor = (): SxProps<Theme> => {
    return {
        [`& .MuiTableHead-root .MuiTableRow-head,
                    & .MuiTableHead-root .MuiTableRow-head .MuiTableCell-root`]:
            {
                bgcolor: (theme) => tableCellBackground[theme.palette.mode],
            },
    };
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
        zIndex: chipDeleteIndex + zIndexIncrement,
    };
};

export const wrappingTableCell = {
    wordWrap: 'break-word',
    // WARNING - the min width work as you might expect. The max width does NOT
    //  It looks and feels good but the cell will for sure grow larger than just 300px
    //  even though that is what the styling says.
    minWidth: 10,
    maxWidth: 400,
};

export const wrappingTableBodyCell: SxProps<Theme> = {
    ...wrappingTableCell,
    background: (theme) => tableCellBackground[theme.palette.mode],
};

export const wrappingTableBodyHeader: SxProps<Theme> = {
    ...wrappingTableCell,
    background: (theme) => theme.palette.background.default,
};

// RGB translation of #CA3B55.
export const errorOutlinedButtonBackground = {
    light: `rgba(202, 59, 85, 0.12)`,
    dark: `rgba(202, 59, 85, 0.12)`,
};

// TODO: Remove disabled button text-related style objects.
export const disabledButtonText_primary = {
    light: `rgba(58, 86, 202, 0.26)`,
    dark: `rgba(186, 205, 253, 0.26)`,
};

export const disabledButtonText = {
    light: 'rgba(0, 0, 0, 0.26)',
    dark: 'rgba(255, 255, 255, 0.3)',
};

export const outlinedIconButtonStyling: SxProps<Theme> = {
    'borderRadius': 2,
    'border': (theme) => `1px solid ${theme.palette.primary.alpha_50}`,
    'color': (theme) => theme.palette.primary.main,
    '&:hover': {
        border: (theme) => `1px solid ${theme.palette.primary.main}`,
    },
    '&.Mui-disabled': {
        border: (theme) => `1px solid ${theme.palette.primary.alpha_12}`,
    },
};

export const registerPerkCheck = {
    light: '#74d4d4',
    dark: '#74d4d4',
};

export const registerPerkHighlight = {
    light: sample_blue[600],
    dark: sample_blue[400],
};

const defaultLoginButtonStyling = {
    'borderWidth': 2,
    'fontWeight': 600,
    '&:hover': {
        borderWidth: 2,
    },
};

export const loginButtonStyling = {
    light: {
        ...defaultLoginButtonStyling,
        color: sample_grey[600],
    },
    dark: {
        ...defaultLoginButtonStyling,
        color: sample_grey[100],
    },
};

// TODO (echarts) need to make a color service or something to
//  generate a proper ECharts theme. These two colors are taken
//  from ECharts default colors they apply in order
export const eChartsColors = {
    light: ['#acb0e6', '#82d8a3'],
    medium: ['#5353cc', '#208c51'],
};

export const historyCompareColors = {
    light: ['#f96864', '#aed359'],
    dark: ['#cf0d0a', '#526628'],
};

export const historyCompareBorder = `3px solid `;

// If you have custom `sx` on your chip you'll need to import this
//  and spread it into your custom styling. Or just style with `style`
export const chipOutlinedStyling: SxProps<Theme> = {
    '&.MuiChip-outlined': {
        '&.MuiChip-colorPrimary': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(58, 86, 202, 0.12)',
        },
        '&.MuiChip-colorSecondary': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(25, 42, 136, 0.12)',
        },
        '&.MuiChip-colorSuccess': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(42, 121, 66, 0.12)',
        },
        '&.MuiChip-colorError': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(202, 59, 85, 0.12)',
        },
        '&.MuiChip-colorInfo': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(79, 214, 255, 0.12)',
        },
        '&.MuiChip-colorWarning': {
            color: (theme) => theme.palette.text.primary,
            backgroundColor: 'rgba(237, 108, 2, 0.12)',
        },
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
                    '& .MuiChip-deleteIcon, button': {
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
        MuiChip: {
            defaultProps: {
                deleteIcon: <XmarkCircle style={{ fontSize: 14 }} />,
                sx: chipOutlinedStyling,
            },
        },
        MuiFormControl: {
            defaultProps: {
                variant: 'standard',
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'standard',
            },
        },
        MuiSelect: {
            defaultProps: {
                variant: 'standard',
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
        formSectionHeader: {
            fontSize: 18,
            fontWeight: 500,
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
