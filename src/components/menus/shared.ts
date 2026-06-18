import type { PopoverOrigin } from '@mui/material';

// Side-nav menus anchor to the top-left of their trigger and grow upward, so
// the menu's bottom-left corner lines up with the trigger's top-left corner.
export const sideNavMenuAnchorOrigin: PopoverOrigin = {
    horizontal: 'left',
    vertical: 'top',
};

export const sideNavMenuTransformOrigin: PopoverOrigin = {
    horizontal: 'left',
    vertical: 'bottom',
};
