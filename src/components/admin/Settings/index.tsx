import type { PropsWithChildren } from 'react';

import { Box, Divider, Grid, Stack } from '@mui/material';

import { SemanticBranch, useSemanticLeaf } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import { DataPlanes } from 'src/components/admin/Settings/DataPlanes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import { StorageMappings } from 'src/components/admin/Settings/StorageMappings';
import AdminTabs from 'src/components/admin/Tabs';
import TenantSelector from 'src/components/shared/TenantSelector';
import usePageTitle from 'src/hooks/usePageTitle';

// Track section clicks without collecting control text or input values.
function SettingsSection({
    label,
    children,
}: PropsWithChildren<{ label: string }>) {
    const { ref } = useSemanticLeaf<HTMLDivElement>(label);

    return (
        <Box ref={ref} sx={{ display: 'contents' }}>
            {children}
        </Box>
    );
}

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
    });

    return (
        <SemanticBranch label="Admin">
            <SemanticBranch label="Settings">
                <SettingsSection label="Navigation">
                    <AdminTabs />
                </SettingsSection>

                <Grid
                    container
                    spacing={{ xs: 3, md: 2 }}
                    sx={{ py: 2, justifyContent: 'flex-end' }}
                >
                    <Grid
                        size={{ xs: 12, md: 3 }}
                        sx={{ mt: 2.5, display: 'flex', alignItems: 'end' }}
                    >
                        <SettingsSection label="Tenant Selector">
                            <TenantSelector />
                        </SettingsSection>
                    </Grid>
                </Grid>

                <SettingsSection label="Notifications">
                    <PrefixAlerts />
                </SettingsSection>

                <Stack>
                    <Divider sx={{ mt: 2, mb: 4 }} />

                    <SettingsSection label="Storage Mappings">
                        <StorageMappings />
                    </SettingsSection>
                </Stack>

                <Stack>
                    <Divider sx={{ mt: 2, mb: 4 }} />

                    <SettingsSection label="Data Planes">
                        <DataPlanes />
                    </SettingsSection>
                </Stack>
            </SemanticBranch>
        </SemanticBranch>
    );
}

export default Settings;
