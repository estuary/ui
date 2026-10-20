import { Box } from '@mui/material';

// One asset per flag, fetched only when shown; `?no-inline` keeps Vite from
// inlining them. Globbed by path because the package `exports` omit the SVGs.
const FLAG_URLS: Partial<Record<string, string>> = import.meta.glob<string>(
    '/node_modules/country-flag-icons/3x2/*.svg',
    { eager: true, import: 'default', query: '?no-inline' }
);

const WIDTH = 18;
const HEIGHT = 12;

interface CountryFlagProps {
    // ISO 3166-1 alpha-2
    country: string | null;
}

export const CountryFlag = ({ country }: CountryFlagProps) => {
    const url = country
        ? FLAG_URLS[`/node_modules/country-flag-icons/3x2/${country}.svg`]
        : undefined;

    return url ? (
        <Box
            component="img"
            src={url}
            alt=""
            width={WIDTH}
            height={HEIGHT}
            sx={{
                flexShrink: 0,
                display: 'block',
                borderRadius: '2px',
                objectFit: 'cover',
                // Keeps white flags visible on a white menu.
                outline: (theme) => `1px solid ${theme.palette.divider}`,
                outlineOffset: '-1px',
            }}
        />
    ) : (
        // Holds the slot so names line up across options.
        <Box sx={{ flexShrink: 0, width: WIDTH, height: HEIGHT }} />
    );
};
