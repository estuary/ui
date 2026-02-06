import { Grid } from '@mui/material';

import StatOverview from 'src/components/home/dashboard/EntityStatOverview/StatOverview';
import useMonthlyUsage from 'src/components/home/dashboard/EntityStatOverview/useMonthlyUsage';

export default function EntityStatOverview() {
    const {
        captureUsage,
        error,
        indeterminate,
        isLoading,
        materializationUsage,
    } = useMonthlyUsage();

    return (
        <>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <StatOverview
                    entityType="capture"
                    monthlyUsage={captureUsage}
                    monthlyUsageError={error}
                    monthlyUsageIndeterminate={indeterminate}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <StatOverview entityType="collection" />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <StatOverview
                    entityType="materialization"
                    monthlyUsage={materializationUsage}
                    monthlyUsageError={error}
                    monthlyUsageIndeterminate={indeterminate}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>
        </>
    );
}
