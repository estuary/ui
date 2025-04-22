import { Grid, Skeleton } from '@mui/material';

import ConnectorSkeleton from 'src/components/connectors/Grid/Skeleton';

export const ConnectorGridSkeleton = () => {
    return (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 4, md: 12, lg: 12, xl: 12 }}
            margin="auto"
        >
            <Grid item xs={12}>
                <Skeleton />
                <Skeleton style={{ width: 350 }} />
            </Grid>

            <Grid item xs={12}>
                <Skeleton style={{ height: 37 }} />
            </Grid>

            <ConnectorSkeleton condensed />
        </Grid>
    );
};
