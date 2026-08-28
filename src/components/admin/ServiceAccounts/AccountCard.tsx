import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { ServiceAccount, UserGrant } from 'src/gql-types/graphql';

import { Box, ButtonBase, Stack, Typography, useTheme } from '@mui/material';

import { Folder, Lock, WarningTriangle } from 'iconoir-react';

import {
    soonestExpiry,
    tokenExpiry,
} from 'src/components/admin/ServiceAccounts/ExpiryWarning';
import { GrantScroller } from 'src/components/admin/ServiceAccounts/GrantScroller';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
import {
    BAND_REST_SATURATION,
    BANDED_DIV_FACE_CLASS,
    BandedDiv,
    desaturate,
} from 'src/components/shared/BandedDiv';
import {
    monogram,
    MONOGRAM_TEXT_COLOR,
    monogramColor,
    splitCatalogName,
} from 'src/components/shared/CatalogIdentity';
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
    const theme = useTheme();

    const grantCount = grants.length;
    const hasGrants = grantCount > 0;
    const expiry = tokenExpiry(soonestExpiry(serviceAccount.apiKeys));

    // Red once a key has lapsed, orange while one is inside the seven-day
    // warning window. The band and the card's border both carry the color, so
    // they move together: at rest a little short of the full palette value,
    // up to it when the pointer is on the card.
    const expiryColor =
        theme.palette[expiry?.severity === 'expired' ? 'error' : 'warning']
            .main;

    // The card face, styled the same whether it stands alone or sits over the
    // expiry band.
    const faceSx: SystemStyleObject<Theme> = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        p: 2,
        pb: 1,
        background:
            hasGrants || expiry
                ? semiTransparentBackground_oneLayerElevated[theme.palette.mode]
                : 'transparent',
        border: defaultOutline[theme.palette.mode],
        borderColor: expiry
            ? desaturate(expiryColor, BAND_REST_SATURATION)
            : defaultOutlineColor[theme.palette.mode],
        borderStyle: hasGrants ? 'solid' : 'dashed',
        transition: 'border-color 0.1s ease',
    };

    const restOpacity = hasGrants ? 1 : 0.7;
    const hoverOpacity = hasGrants ? 1 : 0.85;

    const cardContent = (
        <Stack spacing={1.75} sx={{ flex: 1 }}>
            {/* Identity */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        flex: 'none',
                        borderRadius: theme.radius.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: MONOGRAM_TEXT_COLOR,
                        background: monogramColor(serviceAccount.catalogName),
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
                    background: theme.palette.divider,
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
                        <GrantScroller baseHeight={62}>
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
                            <Typography variant="caption">No access</Typography>
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );

    // An account with nothing to flag is a plain card: the face styles sit
    // directly on the button, and there is no frame to tuck a band behind.
    if (!expiry) {
        return (
            <ButtonBase
                onClick={() => onOpen(serviceAccount.catalogName)}
                sx={{
                    ...faceSx,
                    'width': '100%',
                    'textAlign': 'left',
                    'borderRadius': theme.radius.lg,
                    'opacity': restOpacity,
                    'transition': 'opacity 0.1s ease, border-color 0.1s ease',
                    '&:hover': {
                        opacity: hoverOpacity,
                        borderColor:
                            defaultOutlineColor_hovered[theme.palette.mode],
                    },
                }}
            >
                {cardContent}
            </ButtonBase>
        );
    }

    return (
        <BandedDiv
            side="bottom"
            bandColor={expiryColor}
            label={
                <>
                    <WarningTriangle width={14} height={14} /> {expiry.label}
                </>
            }
            onClick={() => onOpen(serviceAccount.catalogName)}
            sx={{
                'width': '100%',
                'opacity': restOpacity,
                'transition': 'opacity 0.1s ease',
                '&:hover': {
                    opacity: hoverOpacity,
                    [`& .${BANDED_DIV_FACE_CLASS}`]: {
                        borderColor: expiryColor,
                    },
                },
            }}
            faceSx={faceSx}
        >
            {cardContent}
        </BandedDiv>
    );
}
