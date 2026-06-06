import { Grid } from '@mui/material';

import EntityStatOverview from 'src/components/home/dashboard/EntityStatOverview';

export default function Dashboard() {
    return (
        <Grid container spacing={{ xs: 2 }} style={{ marginTop: 16 }}>
            <EntityStatOverview />
        </Grid>
    );
}
