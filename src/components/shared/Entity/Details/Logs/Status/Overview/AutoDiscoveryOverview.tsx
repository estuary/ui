import { Grid, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import { cardHeaderSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import AutoDiscoverOutcome from './AutoDiscoverOutcome';
import AutoDiscoveryStatus from './AutoDiscoveryStatus';

export default function AutoDiscoveryOverview() {
    const intl = useIntl();

    return (
        <Grid item xs={12} md={6} lg={3}>
            <CardWrapper>
                <Stack spacing={2}>
                    <Stack direction="row">
                        <AutoDiscoveryStatus />

                        <Typography
                            component="div"
                            sx={{ ...cardHeaderSx, mr: 3 }}
                        >
                            {intl.formatMessage({
                                id: 'details.ops.status.overview.autoDiscovery.header',
                            })}
                        </Typography>
                    </Stack>

                    <AutoDiscoverOutcome />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
