import type { ReactNode } from 'react';

import { useState } from 'react';

import { Box, Button, Stack, Typography } from '@mui/material';

import { NavArrowLeft } from 'iconoir-react';
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';

import { useServiceAccount } from 'src/api/gql/serviceAccounts';
import { authenticatedRoutes } from 'src/app/routes';
import { CreateApiKeyDialog } from 'src/components/admin/ServiceAccounts/CreateApiKeyDialog';
import { ApiKeysSection } from 'src/components/admin/ServiceAccounts/Details/ApiKeysSection';
import { GrantsSection } from 'src/components/admin/ServiceAccounts/Details/GrantsSection';
import { IdentityCard } from 'src/components/admin/ServiceAccounts/IdentityCard';
import { splitCatalogName } from 'src/components/admin/ServiceAccounts/shared';
import { UsageIndicator } from 'src/components/admin/ServiceAccounts/UsageIndicator';
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
            <Typography component="div" variant="body2" sx={{ mt: 0.5 }}>
                {children}
            </Typography>
        </Box>
    );
}

// The header wears the card larger than the create dialog does.
const IDENTITY_SCALE = 1.25;

export function ServiceAccountDetails() {
    const navigate = useNavigate();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    // Taken from the URL rather than the fetched account so the breadcrumb is
    // populated on the first render instead of appearing once the query lands.
    usePageTitle({
        header: authenticatedRoutes.admin.serviceAccounts.details.title,
        headerDetail: catalogName
            ? splitCatalogName(catalogName).leaf
            : undefined,
    });

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
                <IdentityCard
                    name={leaf}
                    location={prefix}
                    scale={IDENTITY_SCALE}
                    sx={{ mb: 4.5 }}
                />

                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 6, mb: 5 }}>
                    <MetaItem label="Created">
                        {DateTime.fromISO(
                            serviceAccount.createdAt
                        ).toLocaleString(DateTime.DATE_MED)}
                    </MetaItem>
                    <MetaItem label="Created by">
                        {serviceAccount.createdByEmail ?? 'Unknown'}
                    </MetaItem>
                    <MetaItem label="Last active">
                        <UsageIndicator
                            lastUsedAt={serviceAccount.lastUsedAt}
                            variant="body2"
                        />
                    </MetaItem>
                    <MetaItem label="API keys">
                        {serviceAccount.apiKeys.length === 0
                            ? 'None'
                            : String(serviceAccount.apiKeys.length)}
                    </MetaItem>
                </Stack>

                <Box sx={{ mb: 5 }}>
                    <GrantsSection
                        catalogName={serviceAccount.catalogName}
                        grants={serviceAccount.grants}
                        tokenCount={serviceAccount.apiKeys.length}
                    />
                </Box>

                <ApiKeysSection
                    tokens={serviceAccount.apiKeys}
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
        <Box sx={{ py: 2 }}>
            <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                {backButton}
                {body}
            </Box>
        </Box>
    );
}
