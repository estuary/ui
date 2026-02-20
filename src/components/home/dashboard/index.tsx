import { Box, Grid } from '@mui/material';

import EntityStatOverview from 'src/components/home/dashboard/EntityStatOverview';
import TenantSelector from 'src/components/shared/TenantSelector';

export default function Dashboard() {
    return (
        <Grid container spacing={{ xs: 2 }} style={{ marginTop: 16 }}>
            <Grid
                size={{ xs: 12 }}
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
                <Box style={{ width: 300 }}>
                    <TenantSelector />
                </Box>
            </Grid>

            <EntityStatOverview />
        </Grid>
    );
}
