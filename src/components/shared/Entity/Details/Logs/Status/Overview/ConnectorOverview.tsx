import { Grid, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/shared/CardWrapper';
import { cardHeaderSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import ConnectorStatus from './ConnectorStatus';
import ConnectorStatusDetail from './ConnectorStatusDetail';
import ConnectorUpdatedDetail from './ConnectorUpdatedDetail';

export default function ConnectorOverview() {
    const intl = useIntl();

    return (
        <Grid item xs={12} md={6} lg={3}>
            <CardWrapper>
                <Stack
                    direction="row"
                    style={{ marginBottom: 16, marginLeft: -4 }}
                >
                    <ConnectorStatus />

                    <Typography component="div" sx={{ ...cardHeaderSx, mr: 3 }}>
                        {intl.formatMessage({
                            id: 'details.ops.status.overview.connector.header',
                        })}
                    </Typography>
                </Stack>

                <Stack spacing={2} style={{ marginLeft: 14 }}>
                    <ConnectorStatusDetail headerMessageId="details.ops.status.overview.connector.subheaderLastStatus" />

                    <ConnectorUpdatedDetail headerMessageId="details.ops.status.overview.connector.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
