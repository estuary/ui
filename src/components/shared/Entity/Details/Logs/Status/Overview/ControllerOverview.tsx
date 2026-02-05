import { Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import ActivationDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ActivationDetail';
import ControllerStatus from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerStatus';
import ControllerUpdatedDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ControllerUpdatedDetail';
import { cardHeaderSx } from 'src/context/Theme';

export default function ControllerOverview() {
    const intl = useIntl();

    return (
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <CardWrapper>
                <Stack
                    direction="row"
                    style={{ marginBottom: 16, marginLeft: -4 }}
                >
                    <ControllerStatus />

                    <Typography component="div" sx={{ ...cardHeaderSx, mr: 3 }}>
                        {intl.formatMessage({
                            id: 'details.ops.status.overview.controller.header',
                        })}
                    </Typography>
                </Stack>

                <Stack spacing={2} style={{ marginLeft: 14 }}>
                    <ActivationDetail headerMessageId="details.ops.status.overview.controller.subheaderActivation" />

                    <ControllerUpdatedDetail headerMessageId="details.ops.status.overview.generic.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
