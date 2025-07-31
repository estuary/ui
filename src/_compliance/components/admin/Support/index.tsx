import { Divider, Grid, Typography } from '@mui/material';

import DeleteRecordings from 'src/_compliance/components/admin/Support/DeleteRecordings';
import EnhancedSupportChip from 'src/_compliance/components/admin/Support/EnhancedSupportChip';
import SupportBenefits from 'src/_compliance/guards/EnhancedSupport/SupportBenefits';
import SupportDetails from 'src/_compliance/guards/EnhancedSupport/SupportDetails';
import { authenticatedRoutes } from 'src/app/routes';
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
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Enhanced Support
                    </Typography>

                    <Typography>
                        Below you may control when and for how long we may
                        provide Enhanced Support
                    </Typography>

                    <Grid item xs={12} md={8} lg={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <SupportBenefits />
                            </Grid>
                            <Grid item xs={12}>
                                <SupportDetails />
                            </Grid>
                            <Grid item xs={12}>
                                <EnhancedSupportChip />
                            </Grid>
                        </Grid>
                    </Grid>
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
