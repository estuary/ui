import type { SxProps, Theme } from '@mui/material';
import type { ServiceAccount, UserGrant } from 'src/gql-types/graphql';

import { useState } from 'react';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { decomposeColor, recomposeColor } from '@mui/material/styles';

import { Folder, Lock, WarningTriangle } from 'iconoir-react';

import {
    soonestExpiry,
    tokenExpiry,
} from 'src/components/admin/ServiceAccounts/ExpiryWarning';
import { GrantScroller } from 'src/components/admin/ServiceAccounts/GrantScroller';
import {
    monogram,
    MONOGRAM_TEXT_COLOR,
    monogramColor,
    splitCatalogName,
} from 'src/components/admin/ServiceAccounts/shared';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
import { CatalogPath } from 'src/components/shared/CatalogPath';
import {
    defaultOutline,
    defaultOutlineColor,
    defaultOutlineColor_hovered,
    diminishedTextColor,
    semiTransparentBackground_oneLayerElevated,
} from 'src/context/Theme';

interface AccountCardProps {
    serviceAccount: ServiceAccount;
    grants: UserGrant[];
    onOpen: (catalogName: string) => void;
}

const CARD_SURFACE_CLASS = 'service-account-card-surface';
const EXPIRY_BAND_CLASS = 'service-account-card-expiry';

// The expiry color sits at rest a little short of its full palette value, and
// comes up to it when the pointer is on the card. The band and the card's border
// both carry it, so they move together.
const EXPIRY_SATURATION = 0.5;

// Pulls a color toward its own luminance, which is what the CSS `saturate()`
// filter computes, so a color mixed here matches one the browser filters.
function desaturate(color: string, amount: number) {
    const [red, green, blue] = decomposeColor(color).values;
    const luminance = 0.213 * red + 0.715 * green + 0.072 * blue;
    const mix = (channel: number) =>
        Math.round(luminance + (channel - luminance) * amount);

    return recomposeColor({
        type: 'rgb',
        values: [mix(red), mix(green), mix(blue)],
    });
}

const META_LABEL_SX: SxProps<Theme> = {
    fontSize: 10,
    letterSpacing: '0.08em',
    // textTransform: 'uppercase',
    fontWeight: 600,
    color: (theme) => diminishedTextColor[theme.palette.mode],
};

export function AccountCard({
    serviceAccount,
    grants,
    onOpen,
}: AccountCardProps) {
    const grantCount = grants.length;
    const hasGrants = grantCount > 0;
    const expiry = tokenExpiry(soonestExpiry(serviceAccount.apiKeys));
    const expiryPalette = expiry?.severity === 'expired' ? 'error' : 'warning';

    const [hovered, setHovered] = useState(false);

    return (
        <ButtonBase
            onClick={() => onOpen(serviceAccount.catalogName)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                // The frame holds the card face and, when there is an expiry
                // to flag, the colored band tucked behind its bottom edge.
                // `overflow: hidden` rounds the band's bottom corners to the
                // card radius.
                'display': 'flex',
                'flexDirection': 'column',
                'alignItems': 'stretch',
                'width': '100%',
                'textAlign': 'left',
                'borderRadius': (theme) => theme.radius.lg,
                'overflow': 'hidden',
                'opacity': hasGrants ? 1 : 0.7,
                'transition': 'opacity 0.1s ease',
                '&:hover': {
                    opacity: hasGrants ? 1 : 0.85,
                    [`& .${CARD_SURFACE_CLASS}`]: {
                        borderColor: (theme) =>
                            expiry
                                ? theme.palette[expiryPalette].main
                                : defaultOutlineColor_hovered[
                                      theme.palette.mode
                                  ],
                    },
                    [`& .${EXPIRY_BAND_CLASS}`]: {
                        background: (theme) =>
                            theme.palette[expiryPalette].main,
                    },
                },
            }}
        >
            <Stack
                className={CARD_SURFACE_CLASS}
                spacing={1.75}
                sx={{
                    // Painted over the band, and opaque so only the rounded
                    // corners let it through.
                    position: 'relative',
                    zIndex: 1,
                    flex: 1,
                    p: 2,
                    borderRadius: (theme) => theme.radius.lg,
                    background: (theme) =>
                        hasGrants || expiry
                            ? semiTransparentBackground_oneLayerElevated[
                                  theme.palette.mode
                              ]
                            : 'transparent',
                    border: (theme) => defaultOutline[theme.palette.mode],
                    borderColor: (theme) =>
                        expiry
                            ? desaturate(
                                  theme.palette[expiryPalette].main,
                                  EXPIRY_SATURATION
                              )
                            : defaultOutlineColor[theme.palette.mode],
                    borderStyle: hasGrants ? 'solid' : 'dashed',
                    transition: 'border-color 0.1s ease',
                }}
            >
                {/* Identity */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            flex: 'none',
                            borderRadius: (theme) => theme.radius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            color: MONOGRAM_TEXT_COLOR,
                            background: monogramColor(
                                serviceAccount.catalogName
                            ),
                        }}
                    >
                        {monogram(serviceAccount.catalogName)}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                            component="span"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: 'text.primary',
                                fontSize: 14,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {splitCatalogName(serviceAccount.catalogName).leaf}
                        </Box>

                        <UsageIndicator
                            lastUsedAt={serviceAccount.lastUsedAt}
                            sx={{ mt: 0.5 }}
                        />
                    </Box>
                </Stack>

                <Box
                    sx={{
                        height: '1px',
                        background: (theme) => theme.palette.divider,
                    }}
                />

                {/* Details */}
                <Stack spacing={1.25} sx={{ flex: 1 }}>
                    <Stack spacing={0.75} sx={{ flex: 1 }}>
                        <Typography component="span" sx={META_LABEL_SX}>
                            Access{' '}
                            {grantCount > 3
                                ? `(${grantCount}
                            ${grantCount === 1 ? 'grant' : 'grants'})`
                                : null}
                        </Typography>

                        {hasGrants ? (
                            <GrantScroller
                                baseHeight={62}
                                cardHovered={hovered}
                            >
                                {grants.map((grant) => (
                                    <Stack
                                        key={grant.prefix}
                                        direction="row"
                                        spacing={0.75}
                                        sx={{ alignItems: 'flex-start' }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flex: 'none',
                                                pt: '3px',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            <Folder width={13} height={13} />
                                        </Box>
                                        <CatalogPath
                                            path={grant.prefix}
                                            variant="caption"
                                        />
                                    </Stack>
                                ))}
                            </GrantScroller>
                        ) : (
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{
                                    alignItems: 'center',
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                }}
                            >
                                <Lock width={13} height={13} />
                                <Typography variant="caption">
                                    No access
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Stack>

            {/* Expiry band, running behind the card face's bottom edge and
                out past it. Red once a key has lapsed, orange while one is
                inside the seven-day warning window. */}
            {expiry ? (
                <Stack
                    className={EXPIRY_BAND_CLASS}
                    direction="row"
                    spacing={0.75}
                    sx={{
                        // Pulled up by one corner radius so the card's rounded
                        // bottom corners curve away onto the band.
                        flex: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        py: 0.5,
                        mt: (theme) => `-${theme.radius.lg}`,
                        pt: (theme) => `calc(${theme.radius.lg} + 4px)`,
                        background: (theme) =>
                            desaturate(
                                theme.palette[expiryPalette].main,
                                EXPIRY_SATURATION
                            ),
                        color: (theme) =>
                            theme.palette.getContrastText(
                                theme.palette[expiryPalette].main
                            ),
                        transition: 'background-color 0.1s ease',
                    }}
                >
                    <WarningTriangle width={14} height={14} />
                    <Typography
                        variant="caption"
                        color="inherit"
                        sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                        {expiry.label}
                    </Typography>
                </Stack>
            ) : null}
        </ButtonBase>
    );
}
