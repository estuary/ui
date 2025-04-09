import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ConnectorStatusDetail from 'src/components/shared/Entity/Details/Status/Overview/ConnectorStatusDetail';
import ConnectorUpdatedDetail from 'src/components/shared/Entity/Details/Status/Overview/ConnectorUpdatedDetail';
import { cardHeaderSx } from 'src/context/Theme';

export const ConnectorStatusSection = () => {
    const intl = useIntl();
    // const theme = useTheme();

    return (
        <Stack
            style={{
                minWidth: 300,
            }}
        >
            <Typography component="div" sx={{ ...cardHeaderSx, mb: 1, mr: 3 }}>
                {intl.formatMessage({
                    id: 'details.ops.status.overview.connector.header',
                })}
            </Typography>

            <ConnectorStatusDetail headerMessageId="details.ops.status.overview.connector.subheaderLastStatus" />

            <ConnectorUpdatedDetail headerMessageId="details.ops.status.overview.generic.subheaderLastUpdated" />
        </Stack>
    );
};
