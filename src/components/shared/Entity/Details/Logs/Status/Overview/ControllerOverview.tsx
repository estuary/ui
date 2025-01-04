import { Grid, MenuItem, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import { cardHeaderSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import OptionMenu from '../OptionMenu';
import ActivationDetail from './ActivationDetail';
import ControllerStatus from './ControllerStatus';
import ControllerUpdatedDetail from './ControllerUpdatedDetail';

export default function ControllerOverview() {
    const intl = useIntl();

    return (
        <Grid item xs={12} md={6} lg={3}>
            <CardWrapper>
                <Stack spacing={2}>
                    <Stack
                        style={{
                            marginBottom: 8,
                        }}
                    >
                        <Stack
                            direction="row"
                            style={{
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography
                                component="div"
                                sx={{ ...cardHeaderSx, mr: 3 }}
                            >
                                {intl.formatMessage({
                                    id: 'details.ops.status.overview.controller.header',
                                })}
                            </Typography>

                            <OptionMenu identifier="controller-overview">
                                <MenuItem>
                                    <Typography>View details</Typography>
                                </MenuItem>

                                <MenuItem>
                                    <Typography>Contact support</Typography>
                                </MenuItem>
                            </OptionMenu>
                        </Stack>

                        <ControllerStatus />
                    </Stack>

                    <ActivationDetail headerMessageId="details.ops.status.overview.controller.subheaderActivation" />

                    <ControllerUpdatedDetail headerMessageId="details.ops.status.overview.controller.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
