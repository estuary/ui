import { Grid, Skeleton } from '@mui/material';

import {
    CONNECTOR_GRID_COLUMNS,
    CONNECTOR_GRID_SPACING,
} from 'src/components/connectors/Grid/shared';
import ConnectorSkeleton from 'src/components/connectors/Grid/Skeleton';

export const ConnectorGridSkeleton = () => {
    return (
        <Grid
            container
            spacing={CONNECTOR_GRID_SPACING}
            columns={CONNECTOR_GRID_COLUMNS}
            margin="auto"
        >
            <Grid size={{ xs: 12 }}>
                <Skeleton />
                <Skeleton style={{ width: 350 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Skeleton style={{ height: 37 }} />
            </Grid>

            <ConnectorSkeleton condensed />
        </Grid>
    );
};
