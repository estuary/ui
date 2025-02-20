import { PaletteMode } from '@mui/material';
import {
    errorColoredOutline_hovered,
    infoColoredOutline_hovered,
    primaryColoredOutline_hovered,
    semiTransparentBackground_error,
    semiTransparentBackground_info,
    semiTransparentBackground_primary,
    semiTransparentBackground_success,
    semiTransparentBackground_warning,
    successColoredOutline_hovered,
    warningColoredOutline_hovered,
} from 'context/Theme';

export const BANNER_HEIGHT = 28;

export const getSemanticBackgroundColor = (
    colorMode: PaletteMode,
    severity: string
): string => {
    switch (severity) {
        case 'success':
            return semiTransparentBackground_success[colorMode];
        case 'warning':
            return semiTransparentBackground_warning[colorMode];
        case 'error':
            return semiTransparentBackground_error[colorMode];
        case 'info':
            return semiTransparentBackground_info[colorMode];
        default:
            return semiTransparentBackground_primary[colorMode];
    }
};

export const getSemanticBorder = (
    colorMode: PaletteMode,
    severity: string
): string => {
    switch (severity) {
        case 'success':
            return successColoredOutline_hovered[colorMode];
        case 'warning':
            return warningColoredOutline_hovered[colorMode];
        case 'error':
            return errorColoredOutline_hovered[colorMode];
        case 'info':
            return infoColoredOutline_hovered[colorMode];
        default:
            return primaryColoredOutline_hovered[colorMode];
    }
};

export const isOverflown = (el: HTMLElement | null) => {
    if (!el) {
        return false;
    }

    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
};
