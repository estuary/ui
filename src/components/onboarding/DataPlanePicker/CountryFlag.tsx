import { Box } from '@mui/material';

// Asset URLs for every flag in `country-flag-icons`, keyed by file path. The
// glob emits each SVG as its own file, so a flag is only downloaded when an
// option shows it; only this map of URLs ships in the bundle. `?no-inline`
// stops Vite base64-inlining the small SVGs into the JS. The package's
// `exports` map does not list the SVGs, so they are globbed from disk.
const FLAG_URLS = import.meta.glob<string>(
    '/node_modules/country-flag-icons/3x2/*.svg',
    { eager: true, import: 'default', query: '?no-inline' }
);

const getFlagUrl = (country: string) =>
    FLAG_URLS[`/node_modules/country-flag-icons/3x2/${country}.svg`] as
        | string
        | undefined;

const WIDTH = 18;
const HEIGHT = 12;

interface CountryFlagProps {
    // ISO 3166-1 alpha-2 code.
    country: string | null;
}

// Decorative: the region name beside it already says where it is. When there
// is no flag, the slot stays empty so names line up across options.
export const CountryFlag = ({ country }: CountryFlagProps) => {
    const url = country ? getFlagUrl(country.toUpperCase()) : undefined;

    return url ? (
        <Box
            component="img"
            src={url}
            alt=""
            aria-hidden
            width={WIDTH}
            height={HEIGHT}
            sx={{
                flexShrink: 0,
                display: 'block',
                borderRadius: '2px',
                objectFit: 'cover',
                // A hairline over the image, so white flags show on white.
                outline: (theme) => `1px solid ${theme.palette.divider}`,
                outlineOffset: '-1px',
            }}
        />
    ) : (
        <Box sx={{ flexShrink: 0, width: WIDTH, height: HEIGHT }} />
    );
};
