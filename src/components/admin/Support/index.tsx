import { Divider, Grid, Typography } from '@mui/material';

import SupportBenefits from 'src/app/guards/ConsentGuard/SupportBenefits';
import SupportDetails from 'src/app/guards/ConsentGuard/SupportDetails';
import { authenticatedRoutes } from 'src/app/routes';
import DeleteRecordings from 'src/components/admin/Support/DeleteRecordings';
import EnhancedSupportChip from 'src/components/admin/Support/EnhancedSupportChip';
import AdminTabs from 'src/components/admin/Tabs';
import usePageTitle from 'src/hooks/usePageTitle';

function AdminLegal() {
    usePageTitle({
        header: authenticatedRoutes.admin.support.title,
    });

    return (
        <>
            <AdminTabs />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Enhanced Support
                    </Typography>

                    <Typography>
                        Below you may control when and for how long we may
                        provide Enhanced Support
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} lg={6}>
                            <SupportBenefits />
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            <SupportDetails />
                        </Grid>
                    </Grid>

                    <EnhancedSupportChip />
                </Grid>
            </Grid>

            <Divider sx={{ mt: 1, mb: 2 }} />
            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <DeleteRecordings />
            </Grid>
        </>
    );
}

export default AdminLegal;
