import { useEffect, useState } from 'react';

import { Box } from '@mui/material';

// One asset per flag, fetched only when shown; `?no-inline` keeps Vite from
// inlining them. Globbed by path because the package `exports` omit the SVGs.
const FLAG_URLS: Partial<Record<string, string>> = import.meta.glob<string>(
    '/node_modules/country-flag-icons/3x2/*.svg',
    { eager: true, import: 'default', query: '?no-inline' }
);

const getFlagUrl = (country: string | null) =>
    country
        ? FLAG_URLS[`/node_modules/country-flag-icons/3x2/${country}.svg`]
        : undefined;

const PRELOAD_TIMEOUT_MS = 3000;

// True once the flags are cached, so the menu never opens with blank flags.
export const useFlagsPreloaded = (countries: (string | null)[]) => {
    const key = [...new Set(countries)].sort().join();
    const [loadedKey, setLoadedKey] = useState<string>();

    useEffect(() => {
        const urls = key
            .split(',')
            .flatMap((country) => getFlagUrl(country) ?? []);
        let active = true;
        const done = () => active && setLoadedKey(key);
        const timeout = setTimeout(done, PRELOAD_TIMEOUT_MS);

        void Promise.all(
            urls.map(
                (url) =>
                    new Promise((resolve) => {
                        const image = new Image();
                        image.onload = resolve;
                        image.onerror = resolve;
                        image.src = url;
                    })
            )
        ).then(done);

        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, [key]);

    return loadedKey === key;
};

const WIDTH = 18;
const HEIGHT = 12;

interface CountryFlagProps {
    // ISO 3166-1 alpha-2
    country: string | null;
}

export const CountryFlag = ({ country }: CountryFlagProps) => {
    const url = getFlagUrl(country);

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
