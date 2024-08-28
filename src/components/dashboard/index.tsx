import { Box, Grid } from '@mui/material';
import TenantSelector from 'components/shared/TenantSelector';
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
                    Icon={<CloudUpload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_teal}
                    entityType="capture"
                    monthlyUsage={captureUsage}
                    monthlyUsageError={error}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <EntityStatOverview
                    Icon={<DatabaseScript fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_blue}
                    entityType="collection"
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <EntityStatOverview
                    Icon={<CloudDownload fontSize={ICON_SIZE} />}
                    background={semiTransparentBackground_purple}
                    entityType="materialization"
                    monthlyUsage={materializationUsage}
                    monthlyUsageError={error}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>
        </Grid>
    );
}
