import type { SxProps, Theme } from '@mui/material';

import { useMemo } from 'react';

import { Box, Stack } from '@mui/material';

import { Home } from 'iconoir-react';

import {
    identityLayout,
    TRUNCATE_SX,
} from 'src/components/admin/ServiceAccounts/identityLayout';
import {
    monogram,
    monogramColor,
} from 'src/components/admin/ServiceAccounts/shared';
import { appendWithForwardSlash } from 'src/utils/misc-utils';

interface ServiceAccountIdentityProps {
    /** The account's leaf name, without its prefix. */
    name: string;
    /** The catalog prefix the account lives under, trailing slash included. */
    location: string;
    /** Multiplies every measurement. 1 is the create dialog's card. */
    scale?: number;
    sx?: SxProps<Theme>;
}

/**
 * How a service account is presented: a monogram tile over the color its
 * catalog name hashes to, with the leaf name above the catalog location it
 * lives under.
 */
export function ServiceAccountIdentity({
    name,
    location,
    scale = 1,
    sx,
}: ServiceAccountIdentityProps) {
    const {
        cardSx,
        columnSx,
        monogramSx,
        nameTextSx,
        locationTextSx,
        locationIconSize,
    } = useMemo(() => identityLayout(scale), [scale]);

    // The color is hashed from the whole catalog name, so two accounts with the
    // same leaf under different prefixes wear different tiles.
    const catalogName = `${appendWithForwardSlash(location)}${name}`;

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={[cardSx, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}
        >
            <Box sx={{ ...monogramSx, background: monogramColor(catalogName) }}>
                {monogram(name)}
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
                    {name}
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
                        {location}
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}
