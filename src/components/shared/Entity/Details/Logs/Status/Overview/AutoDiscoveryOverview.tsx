import { Grid, Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import AutoDiscoverOutcome from 'src/components/shared/Entity/Details/Logs/Status/Overview/AutoDiscoverOutcome';
import AutoDiscoveryStatus from 'src/components/shared/Entity/Details/Logs/Status/Overview/AutoDiscoveryStatus';
import { cardHeaderSx } from 'src/context/Theme';

export default function AutoDiscoveryOverview() {
    return (
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <CardWrapper>
                <Stack
                    direction="row"
                    style={{ marginBottom: 16, marginLeft: -4 }}
                >
                    <AutoDiscoveryStatus />

                    <Typography component="div" sx={{ ...cardHeaderSx, mr: 3 }}>
                        Latest Auto Discovery
                    </Typography>
                </Stack>

                <Stack spacing={2} style={{ marginLeft: 14 }}>
                    <AutoDiscoverOutcome />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
