import { Divider, Grid, Stack } from '@mui/material';

import { SemanticBranch } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import { DataPlanes } from 'src/components/admin/Settings/DataPlanes';
import PrefixAlerts from 'src/components/admin/Settings/PrefixAlerts';
import { StorageMappings } from 'src/components/admin/Settings/StorageMappings';
import AdminTabs from 'src/components/admin/Tabs';
import TenantSelector from 'src/components/shared/TenantSelector';
import usePageTitle from 'src/hooks/usePageTitle';

function Settings() {
    usePageTitle({
        header: authenticatedRoutes.admin.settings.title,
    });

    return (
        <SemanticBranch label="Admin">
            <SemanticBranch label="Settings">
                <SemanticBranch label="Navigation">
                    <AdminTabs />
                </SemanticBranch>

                <Grid
                    container
                    spacing={{ xs: 3, md: 2 }}
                    sx={{ py: 2, justifyContent: 'flex-end' }}
                >
                    <Grid
                        size={{ xs: 12, md: 3 }}
                        sx={{ mt: 2.5, display: 'flex', alignItems: 'end' }}
                    >
                        <SemanticBranch label="Tenant Selector">
                            <TenantSelector />
                        </SemanticBranch>
                    </Grid>
                </Grid>

                <SemanticBranch label="Notifications">
                    <PrefixAlerts />
                </SemanticBranch>

                <Stack>
                    <Divider sx={{ mt: 2, mb: 4 }} />

                    <SemanticBranch label="Storage Mappings">
                        <StorageMappings />
                    </SemanticBranch>
                </Stack>

                <Stack>
                    <Divider sx={{ mt: 2, mb: 4 }} />

                    <SemanticBranch label="Data Planes">
                        <DataPlanes />
                    </SemanticBranch>
                </Stack>
            </SemanticBranch>
        </SemanticBranch>
    );
}

export default Settings;
