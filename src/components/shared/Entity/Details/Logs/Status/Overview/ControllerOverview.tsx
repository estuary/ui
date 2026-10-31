import { Grid, Stack, Typography } from '@mui/material';

import CardWrapper from 'src/components/shared/CardWrapper';
import ActivationDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ActivationDetail';
import ControllerStatus from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerStatus';
import ControllerUpdatedDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerUpdatedDetail';
import { cardHeaderSx } from 'src/context/Theme';

export default function ControllerOverview() {
    return (
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <CardWrapper>
                <Stack
                    direction="row"
                    style={{ marginBottom: 16, marginLeft: -4 }}
                >
                    <ControllerStatus />

                    <Typography component="div" sx={{ ...cardHeaderSx, mr: 3 }}>
                        Controller
                    </Typography>
                </Stack>

                <Stack spacing={2} style={{ marginLeft: 14 }}>
                    <ActivationDetail header="Data Plane Activation" />

                    <ControllerUpdatedDetail header="Last Updated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
