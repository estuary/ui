import { Grid } from '@mui/material';

import StatOverview from './StatOverview';
import useMonthlyUsage from './useMonthlyUsage';

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
            <Grid item xs={12} md={4}>
                <StatOverview
                    entityType="capture"
                    monthlyUsage={captureUsage}
                    monthlyUsageError={error}
                    monthlyUsageIndeterminate={indeterminate}
                    monthlyUsageLoading={isLoading}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <StatOverview entityType="collection" />
            </Grid>

            <Grid item xs={12} md={4}>
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
