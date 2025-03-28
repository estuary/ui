import { Grid, Stack, Typography } from '@mui/material';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';
import { useIntl } from 'react-intl';
import ActivationDetail from './ActivationDetail';
import ControllerStatus from './ControllerStatus';
import ControllerUpdatedDetail from './ControllerUpdatedDetail';

export default function ControllerOverview() {
    const intl = useIntl();

    return (
        <Grid item xs={12} md={6} lg={3}>
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

                    <ControllerUpdatedDetail headerMessageId="details.ops.status.overview.controller.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
