import type { ReactNode } from 'react';

import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { NavArrowLeft, Plus } from 'iconoir-react';

import { DateTime } from 'luxon';

import { useNavigate } from 'react-router-dom';

import { useServiceAccount } from 'src/api/gql/serviceAccounts';
import { authenticatedRoutes } from 'src/app/routes';
import { CreateApiKeyDialog } from 'src/components/admin/ServiceAccounts/CreateApiKeyDialog';
import { ApiKeysSection } from 'src/components/admin/ServiceAccounts/Details/ApiKeysSection';
import { GrantsSection } from 'src/components/admin/ServiceAccounts/Details/GrantsSection';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
import {
    monogram,
    splitCatalogName,
} from 'src/components/admin/ServiceAccounts/shared';
import AdminTabs from 'src/components/admin/Tabs';
import { logoColors } from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import usePageTitle from 'src/hooks/usePageTitle';

const META_LABEL_SX = {
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'text.secondary',
} as const;

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Box>
            <Typography component="div" sx={META_LABEL_SX}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
                {children}
            </Typography>
        </Box>
    );
}

export function ServiceAccountDetails() {
    usePageTitle({
        header: authenticatedRoutes.admin.serviceAccounts.details.title,
    });

    const navigate = useNavigate();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { serviceAccount, fetching } = useServiceAccount(catalogName);

    const [createKeyOpen, setCreateKeyOpen] = useState(false);

    const goBack = () =>
        navigate(authenticatedRoutes.admin.serviceAccounts.fullPath);

    const backButton = (
        <Button
            variant="text"
            startIcon={<NavArrowLeft />}
            onClick={goBack}
            sx={{ color: 'text.secondary', mb: 2.5 }}
        >
            All service accounts
        </Button>
    );

    let body: ReactNode;

    if (!catalogName) {
        body = (
            <Typography color="text.secondary">
                No service account selected.
            </Typography>
        );
    } else if (fetching && !serviceAccount) {
        body = <Typography>Loading…</Typography>;
    } else if (!serviceAccount) {
        body = (
            <Typography color="text.secondary">
                {`Service account “${catalogName}” was not found.`}
            </Typography>
        );
    } else {
        const { prefix, leaf } = splitCatalogName(serviceAccount.catalogName);

        body = (
            <>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center', mb: 4.5 }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            flex: 'none',
                            borderRadius: (theme) => theme.radius.md,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 17,
                            fontWeight: 700,
                            color: '#06121f',
                            background: `linear-gradient(135deg, ${logoColors.purple}, ${logoColors.teal})`,
                        }}
                    >
                        {monogram(serviceAccount.catalogName)}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                            component="span"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: 'text.primary',
                                fontSize: 20,
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {leaf}
                        </Box>
                        <UsageIndicator
                            lastUsedAt={serviceAccount.lastUsedAt}
                            variant="body2"
                            sx={{ mt: 0.75 }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={() => setCreateKeyOpen(true)}
                        sx={{ flex: 'none' }}
                    >
                        Create API key
                    </Button>
                </Stack>

                <Stack
                    direction="row"
                    sx={{ flexWrap: 'wrap', gap: 6, mb: 5 }}
                >
                    <MetaItem label="Location">
                        <Box component="span" sx={{ fontFamily: 'monospace' }}>
                            {prefix}
                        </Box>
                    </MetaItem>
                    <MetaItem label="Created">
                        {DateTime.fromISO(
                            serviceAccount.createdAt
                        ).toLocaleString(DateTime.DATE_MED)}
                    </MetaItem>
                    <MetaItem label="Last used">
                        {serviceAccount.lastUsedAt
                            ? DateTime.fromISO(
                                  serviceAccount.lastUsedAt
                              ).toRelative()
                            : 'Never'}
                    </MetaItem>
                    <MetaItem label="API keys">
                        {serviceAccount.tokens.length === 0
                            ? 'None'
                            : String(serviceAccount.tokens.length)}
                    </MetaItem>
                </Stack>

                <Box sx={{ mb: 5 }}>
                    <GrantsSection
                        catalogName={serviceAccount.catalogName}
                        grants={serviceAccount.grants}
                        tokenCount={serviceAccount.tokens.length}
                    />
                </Box>

                <ApiKeysSection
                    tokens={serviceAccount.tokens}
                    onCreateKey={() => setCreateKeyOpen(true)}
                />

                <CreateApiKeyDialog
                    open={createKeyOpen}
                    catalogName={serviceAccount.catalogName}
                    onClose={() => setCreateKeyOpen(false)}
                />
            </>
        );
    }

    return (
        <>
            <AdminTabs />

            <Box sx={{ p: 2 }}>
                <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                    {backButton}
                    {body}
                </Box>
            </Box>
        </>
    );
}
