import type { ServiceAccount } from 'src/gql-types/graphql';

import { Box, ButtonBase, Stack } from '@mui/material';

import { Lock } from 'iconoir-react';

import CatalogName from 'src/components/admin/ServiceAccounts/CatalogName';
import { monogram } from 'src/components/admin/ServiceAccounts/shared';
import { defaultOutline, defaultOutline_hovered } from 'src/context/Theme';

interface CompactAccountCardProps {
    serviceAccount: ServiceAccount;
    onOpen: (catalogName: string) => void;
}

// A reduced-detail card for accounts with no access grants. Smaller and dimmed,
// it shows only identity — these accounts can't do anything until granted
// access, so they're de-emphasized and grouped at the bottom of the list.
function CompactAccountCard({ serviceAccount, onOpen }: CompactAccountCardProps) {
    return (
        <ButtonBase
            onClick={() => onOpen(serviceAccount.catalogName)}
            sx={{
                'display': 'block',
                'width': '100%',
                'textAlign': 'left',
                'p': 1.5,
                'borderRadius': (theme) => theme.radius.lg,
                'background': 'transparent',
                'border': (theme) => defaultOutline[theme.palette.mode],
                'borderStyle': 'dashed',
                'opacity': 0.7,
                'transition': 'opacity 0.1s ease',
                '&:hover': {
                    border: (theme) =>
                        defaultOutline_hovered[theme.palette.mode],
                    borderStyle: 'dashed',
                    opacity: 0.9,
                },
            }}
        >
            <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: 'center' }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        flex: 'none',
                        borderRadius: (theme) => theme.radius.sm,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'text.secondary',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(247, 249, 252, 0.08)'
                                : 'rgba(11, 19, 30, 0.06)',
                    }}
                >
                    {monogram(serviceAccount.catalogName)}
                </Box>

                <CatalogName
                    catalogName={serviceAccount.catalogName}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                />

                <Box sx={{ display: 'flex', flex: 'none', color: 'text.secondary' }}>
                    <Lock width={14} height={14} />
                </Box>
            </Stack>
        </ButtonBase>
    );
}

export default CompactAccountCard;
