import { Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import ConnectorStatus from 'src/components/shared/Entity/Details/Logs/Status/Overview/ConnectorStatus';
import ConnectorStatusDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ConnectorStatusDetail';
import ConnectorUpdatedDetail from 'src/components/shared/Entity/Details/Logs/Status/Overview/ConnectorUpdatedDetail';
import { cardHeaderSx } from 'src/context/Theme';

export default function ConnectorOverview() {
    const intl = useIntl();

    return (
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
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

                    <ConnectorUpdatedDetail headerMessageId="details.ops.status.overview.generic.subheaderLastUpdated" />
                </Stack>
            </CardWrapper>
        </Grid>
    );
}
