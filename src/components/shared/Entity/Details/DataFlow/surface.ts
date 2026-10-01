import type { Theme } from '@mui/material';

import { lighten } from '@mui/material';

// Opaque surface for nodes, the side panel and canvas controls. Dark mode
// leaves `background.paper` at MUI's neutral #121212, which reads as a
// different hue from the app's blue-grey surfaces, so derive it from
// `background.default` instead.
export const getSurfaceColor = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.default, 0.07)
        : theme.palette.background.paper;
