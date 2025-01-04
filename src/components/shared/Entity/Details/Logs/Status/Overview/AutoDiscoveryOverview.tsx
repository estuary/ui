import { Grid, MenuItem, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import { cardHeaderSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import OptionMenu from '../OptionMenu';
import AutoDiscoverOutcome from './AutoDiscoverOutcome';
import AutoDiscoveryStatus from './AutoDiscoveryStatus';

export default function AutoDiscoveryOverview() {
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
                                    id: 'details.ops.status.overview.autoDiscovery.header',
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

                        <AutoDiscoveryStatus />
                    </Stack>

                    <AutoDiscoverOutcome />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
