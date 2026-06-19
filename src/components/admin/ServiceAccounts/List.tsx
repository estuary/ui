import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { Plus } from 'iconoir-react';
import { useNavigate } from 'react-router-dom';

import { useServiceAccounts } from 'src/api/gql/serviceAccounts';
import { authenticatedRoutes } from 'src/app/routes';
import { AccountCard } from 'src/components/admin/ServiceAccounts/AccountCard';
import { CompactAccountCard } from 'src/components/admin/ServiceAccounts/CompactAccountCard';
import { CreateServiceAccountDialog } from 'src/components/admin/ServiceAccounts/CreateDialog';
import { EmptyState } from 'src/components/admin/ServiceAccounts/EmptyState';
import AlertBox from 'src/components/shared/AlertBox';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

type CreateMode = 'quick' | 'guided';

export function ServiceAccountsList() {
    const navigate = useNavigate();

    const { serviceAccounts, fetching, error } = useServiceAccounts();

    const [createOpen, setCreateOpen] = useState(false);
    const [createMode, setCreateMode] = useState<CreateMode>('quick');

    const openCreate = (mode: CreateMode) => {
        setCreateMode(mode);
        setCreateOpen(true);
    };

    const openDetail = (catalogName: string) => {
        navigate(
            `${authenticatedRoutes.admin.serviceAccounts.details.fullPath}?${GlobalSearchParams.CATALOG_NAME}=${encodeURIComponent(catalogName)}`
        );
    };

    const hasAccounts = serviceAccounts.length > 0;

    // Accounts without any grants are de-emphasized and grouped at the bottom.
    const grantedAccounts = serviceAccounts.filter(
        (account) => account.grants.length > 0
    );
    const noAccessAccounts = serviceAccounts.filter(
        (account) => account.grants.length === 0
    );

    return (
        <Box>
            {hasAccounts ? (
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{
                        mb: 3,
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <Box sx={{ maxWidth: 660 }}>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                            Service Accounts
                        </Typography>
                        <Typography color="text.secondary">
                            Service accounts provide non-login identities for
                            CI/CD pipelines, AI agents, and other programmatic
                            integrations — including the Kafka-compatible API
                            “dekaf”.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={() => openCreate('quick')}
                        sx={{ flex: 'none' }}
                    >
                        Create service account
                    </Button>
                </Stack>
            ) : null}

            <CreateServiceAccountDialog
                open={createOpen}
                mode={createMode}
                onClose={() => setCreateOpen(false)}
                onCreated={openDetail}
            />

            {error ? (
                <AlertBox severity="error" short>
                    <Typography>{error.message}</Typography>
                </AlertBox>
            ) : null}

            {fetching && !hasAccounts ? (
                <Typography sx={{ py: 4, textAlign: 'center' }}>
                    Loading…
                </Typography>
            ) : !hasAccounts ? (
                <EmptyState
                    onQuickCreate={() => openCreate('quick')}
                    onGuidedCreate={() => openCreate('guided')}
                />
            ) : (
                <Stack spacing={4}>
                    {grantedAccounts.length > 0 ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(320px, 400px))',
                                gap: 2,
                            }}
                        >
                            {grantedAccounts.map((account) => (
                                <AccountCard
                                    key={account.catalogName}
                                    serviceAccount={account}
                                    grants={account.grants}
                                    onOpen={openDetail}
                                />
                            ))}
                        </Box>
                    ) : null}

                    {noAccessAccounts.length > 0 ? (
                        <Box>
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{ display: 'block', mb: 1 }}
                            >
                                No access
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: 1.5,
                                }}
                            >
                                {noAccessAccounts.map((account) => (
                                    <CompactAccountCard
                                        key={account.catalogName}
                                        serviceAccount={account}
                                        onOpen={openDetail}
                                    />
                                ))}
                            </Box>
                        </Box>
                    ) : null}
                </Stack>
            )}
        </Box>
    );
}
