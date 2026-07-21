import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';
import type {
    ServiceAccount,
    ServiceAccountGrant,
} from 'src/gql-types/graphql';

import { useState } from 'react';

import { Box, ButtonBase, Stack, Typography } from '@mui/material';

import { Folder, Key, Lock } from 'iconoir-react';

import {
    ExpiryWarning,
    soonestExpiry,
} from 'src/components/admin/ServiceAccounts/ExpiryWarning';
import { GrantScroller } from 'src/components/admin/ServiceAccounts/GrantScroller';
import {
    monogram,
    monogramColor,
    splitCatalogName,
} from 'src/components/admin/ServiceAccounts/shared';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
import {
    defaultBoxShadow,
    defaultOutline,
    defaultOutline_hovered,
    diminishedTextColor,
    semiTransparentBackground,
} from 'src/context/Theme';

interface AccountCardProps {
    serviceAccount: ServiceAccount;
    grants: ServiceAccountGrant[];
    onOpen: (catalogName: string) => void;
}

const META_LABEL_SX: SxProps<Theme> = {
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: (theme) => diminishedTextColor[theme.palette.mode],
};

// Render a catalog prefix so it only wraps after a slash: each "/"-terminated
// segment stays on one line, with a break opportunity between segments.
function slashBreaks(prefix: string): ReactNode[] {
    return prefix
        .split(/(?<=\/)/)
        .filter(Boolean)
        .flatMap((segment, index) => [
            <Box
                key={`segment-${index}`}
                component="span"
                sx={{ whiteSpace: 'nowrap' }}
            >
                {segment}
            </Box>,
            <wbr key={`break-${index}`} />,
        ]);
}

export function AccountCard({
    serviceAccount,
    grants,
    onOpen,
}: AccountCardProps) {
    const grantCount = grants.length;
    const hasGrants = grantCount > 0;

    const keyCount = serviceAccount.tokens.length;

    const [hovered, setHovered] = useState(false);

    return (
        <ButtonBase
            onClick={() => onOpen(serviceAccount.catalogName)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                'display': 'flex',
                'flexDirection': 'column',
                'alignItems': 'stretch',
                'width': '100%',
                'textAlign': 'left',
                'p': 2,
                'borderRadius': (theme) => theme.radius.lg,
                'background': (theme) =>
                    hasGrants
                        ? semiTransparentBackground[theme.palette.mode]
                        : 'transparent',
                'border': (theme) => defaultOutline[theme.palette.mode],
                'borderStyle': hasGrants ? 'solid' : 'dashed',
                'opacity': hasGrants ? 1 : 0.7,
                'transition': 'transform 0.1s ease, box-shadow 0.1s ease',
                '&:hover': {
                    border: (theme) =>
                        defaultOutline_hovered[theme.palette.mode],
                    borderStyle: hasGrants ? 'solid' : 'dashed',
                    boxShadow: hasGrants ? defaultBoxShadow : undefined,
                    opacity: hasGrants ? 1 : 0.85,
                },
            }}
        >
            <Stack spacing={1.75} sx={{ flex: 1 }}>
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
                            color: '#06121f',
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

                    <ExpiryWarning
                        expiresAt={soonestExpiry(serviceAccount.tokens)}
                        sx={{ flex: 'none' }}
                    />
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
                            Access
                        </Typography>

                        {hasGrants ? (
                            <GrantScroller maxHeight={62} hovered={hovered}>
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
                                        <Typography
                                            variant="caption"
                                            sx={{ fontFamily: 'monospace' }}
                                        >
                                            {slashBreaks(grant.prefix)}
                                        </Typography>
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

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography component="span" sx={META_LABEL_SX}>
                            API keys
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: 'center' }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    color: 'text.secondary',
                                }}
                            >
                                <Key width={15} height={15} />
                            </Box>
                            <Typography variant="body2">
                                {keyCount === 0
                                    ? 'No keys'
                                    : `${keyCount} ${keyCount === 1 ? 'key' : 'keys'}`}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </ButtonBase>
    );
}
