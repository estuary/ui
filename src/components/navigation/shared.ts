import type { PaletteMode } from '@mui/material';

import {
    semiTransparentBackground_error,
    semiTransparentBackground_info,
    semiTransparentBackground_success,
    semiTransparentBackground_warning,
} from 'src/context/Theme';

export const BANNER_HEIGHT = 28;

export const getSemanticBackgroundColor = (
    colorMode: PaletteMode,
    severity: string
): string => {
    switch (severity) {
        case 'success':
            return semiTransparentBackground_success[colorMode];
        case 'error':
            return semiTransparentBackground_error[colorMode];
        case 'info':
            return semiTransparentBackground_info[colorMode];
        default:
            return semiTransparentBackground_warning[colorMode];
    }
};

export const isOverflown = (el: HTMLElement | null) => {
    if (!el) {
        return false;
    }

    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
};
