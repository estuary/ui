import { Box, Grid } from '@mui/material';
import TenantSelector from 'components/shared/TenantSelector';
import EntityStatOverview from './EntityStatOverview';
import useMonthlyUsage from './EntityStatOverview/useMonthlyUsage';

export default function Dashboard() {
    const { captureUsage, error, isLoading, materializationUsage } =
        useMonthlyUsage();

    return (
        <Grid container spacing={{ xs: 2 }} style={{ marginTop: 16 }}>
            <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                <Box style={{ width: 300 }}>
                    <TenantSelector />
                </Box>
            </Grid>

            <Grid item xs={12} md={4}>
                <EntityStatOverview
                    entityType="capture"
                    monthlyUsage={captureUsage}
                    monthlyUsageError={error}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <EntityStatOverview entityType="collection" />
            </Grid>

            <Grid item xs={12} md={4}>
                <EntityStatOverview
                    entityType="materialization"
                    monthlyUsage={materializationUsage}
                    monthlyUsageError={error}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>
        </Grid>
    );
}
