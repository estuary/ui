import { Grid } from '@mui/material';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import EntityStatOverview from './EntityStatOverview';
import useMonthlyUsage from './EntityStatOverview/useMonthlyUsage';

const ICON_SIZE = 12;

export default function Dashboard() {
    const { captureUsage, loading, materializationUsage } = useMonthlyUsage();

    return (
        <Grid container spacing={{ xs: 4 }}>
            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<DatabaseScript fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_blue}
                    entityType="collection"
                />
            </Grid>

            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<CloudUpload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_teal}
                    entityType="capture"
                    monthlyUsage={captureUsage}
                    monthlyUsageLoading={loading}
                />
            </Grid>

            <Grid item xs={4}>
                <EntityStatOverview
                    Icon={<CloudDownload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_purple}
                    entityType="materialization"
                    monthlyUsage={materializationUsage}
                    monthlyUsageLoading={loading}
                />
            </Grid>
        </Grid>
    );
}
