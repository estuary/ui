import type { SxProps, Theme } from '@mui/material';

import { useMemo } from 'react';

import { Box, Stack } from '@mui/material';

import { Home } from 'iconoir-react';

import {
    monogram,
    monogramColor,
    splitCatalogName,
} from 'src/components/shared/CatalogIdentity/catalogName';
import {
    identityLayout,
    TRUNCATE_SX,
} from 'src/components/shared/CatalogIdentity/layout';

interface CatalogIdentityProps {
    /** The entity's catalog name, prefix included. */
    catalogName: string;
    /** Multiplies every measurement. 1 is the size an entity is named at. */
    scale?: number;
    sx?: SxProps<Theme>;
}

/**
 * How a catalog entity is presented: a monogram tile over the color its catalog
 * name hashes to, with the leaf name above the prefix it lives under.
 */
export function CatalogIdentity({
    catalogName,
    scale = 1,
    sx,
}: CatalogIdentityProps) {
    const {
        cardSx,
        columnSx,
        monogramSx,
        nameTextSx,
        locationTextSx,
        locationIconSize,
    } = useMemo(() => identityLayout(scale), [scale]);

    // The color is hashed from the whole catalog name, so two entities with the
    // same leaf under different prefixes wear different tiles.
    const { prefix, leaf } = splitCatalogName(catalogName);

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={[cardSx, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}
        >
            <Box sx={{ ...monogramSx, background: monogramColor(catalogName) }}>
                {monogram(leaf)}
            </Box>

            <Box sx={columnSx}>
                <Box
                    sx={{
                        ...nameTextSx,
                        ...TRUNCATE_SX,
                        minWidth: 0,
                        color: 'text.primary',
                    }}
                >
                    {leaf}
                </Box>

                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 'none',
                            color: 'text.secondary',
                        }}
                    >
                        <Home
                            width={locationIconSize}
                            height={locationIconSize}
                        />
                    </Box>

                    <Box
                        sx={{
                            ...locationTextSx,
                            ...TRUNCATE_SX,
                            flex: 1,
                            minWidth: 0,
                            color: 'text.secondary',
                        }}
                    >
                        {prefix}
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}
