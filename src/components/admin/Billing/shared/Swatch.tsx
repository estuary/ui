import { Box } from '@mui/material';

// The square that keys a series, as in a chart legend.
export function Swatch({ color }: { color: string }) {
    return (
        <Box
            aria-hidden
            component="span"
            sx={{
                flex: 'none',
                width: 8,
                height: 8,
                borderRadius: 0.5,
                bgcolor: color,
            }}
        />
    );
}
