import type { ServiceAccount, ServiceAccountGrant } from 'src/gql-types/graphql';
import type { SxProps, Theme } from '@mui/material';

import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';

import { Key, Lock } from 'iconoir-react';

import { DateTime } from 'luxon';

import {
    defaultBoxShadow,
    defaultOutline,
    defaultOutline_hovered,
    diminishedTextColor,
    logoColors,
    semiTransparentBackground,
} from 'src/context/Theme';

import CatalogName from 'src/components/admin/ServiceAccounts/CatalogName';
import { capabilityColor, monogram } from 'src/components/admin/ServiceAccounts/shared';

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

function lastUsedSummary(lastUsedAt: string | null | undefined): string {
    if (!lastUsedAt) {
        return 'Active · never used';
    }

    return `Active · used ${DateTime.fromISO(lastUsedAt).toRelative()}`;
}

function AccountCard({ serviceAccount, grants, onOpen }: AccountCardProps) {
    const grantCount = grants.length;
    const hasGrants = grantCount > 0;
    const keyCount = serviceAccount.tokens.length;

    const capabilities = [...new Set(grants.map((grant) => grant.capability))];

    return (
        <ButtonBase
            onClick={() => onOpen(serviceAccount.catalogName)}
            sx={{
                'display': 'block',
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
                    transform: hasGrants ? 'translateY(-2px)' : undefined,
                },
            }}
        >
            <Stack spacing={1.75}>
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
                            background: hasGrants
                                ? `linear-gradient(135deg, ${logoColors.purple}, ${logoColors.teal})`
                                : (theme) =>
                                      theme.palette.mode === 'dark'
                                          ? 'rgba(247, 249, 252, 0.08)'
                                          : 'rgba(11, 19, 30, 0.06)',
                        }}
                    >
                        {monogram(serviceAccount.catalogName)}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <CatalogName
                            catalogName={serviceAccount.catalogName}
                            sx={{
                                fontSize: 14,
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        />

                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: 'center', mt: 0.5 }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 7,
                                    height: 7,
                                    flex: 'none',
                                    borderRadius: '50%',
                                    backgroundColor: (theme) =>
                                        hasGrants
                                            ? theme.palette.success.main
                                            : diminishedTextColor[
                                                  theme.palette.mode
                                              ],
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {hasGrants
                                    ? lastUsedSummary(serviceAccount.lastUsedAt)
                                    : 'No access granted'}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        height: '1px',
                        background: (theme) => theme.palette.divider,
                    }}
                />

                {/* Details */}
                <Stack spacing={1.25}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography component="span" sx={META_LABEL_SX}>
                            Access
                        </Typography>

                        {hasGrants ? (
                            <Stack
                                direction="row"
                                spacing={0.75}
                                sx={{
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                {capabilities.map((capability) => (
                                    <Chip
                                        key={capability}
                                        label={capability}
                                        size="small"
                                        color={capabilityColor(capability)}
                                    />
                                ))}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {`${grantCount} ${grantCount === 1 ? 'prefix' : 'prefixes'}`}
                                </Typography>
                            </Stack>
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

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography component="span" sx={META_LABEL_SX}>
                            Created
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {DateTime.fromISO(
                                serviceAccount.createdAt
                            ).toLocaleString(DateTime.DATE_MED)}
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>
        </ButtonBase>
    );
}

export default AccountCard;
