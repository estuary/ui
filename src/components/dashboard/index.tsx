import { Grid } from '@mui/material';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import DataTrendsGraph from './DataTrendsGraph';
import Card from './EntityStatOverview/Card';
import GreetingBanner from './GreetingBanner';

export default function Dashboard() {
    return (
        <Grid container spacing={{ xs: 4 }}>
            <Grid item xs={12}>
                <GreetingBanner />
            </Grid>

            <Grid item xs={4}>
                <Card
                    background={semiTransparentBackground_blue}
                    entityType="collection"
                    Icon={<DatabaseScript fontSize={12} />}
                />
            </Grid>

            <Grid item xs={4}>
                <Card
                    background={semiTransparentBackground_teal}
                    entityType="capture"
                    Icon={<CloudUpload fontSize={12} />}
                    monthlyStat={1048}
                />
            </Grid>

            <Grid item xs={4}>
                <Card
                    background={semiTransparentBackground_purple}
                    entityType="materialization"
                    Icon={<CloudDownload fontSize={12} />}
                    monthlyStat={0}
                />
            </Grid>

            <Grid item xs={12}>
                <DataTrendsGraph />
            </Grid>
        </Grid>
    );
}
