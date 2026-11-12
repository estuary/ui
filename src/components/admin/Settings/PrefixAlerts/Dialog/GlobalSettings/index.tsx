import { Stack, Typography } from '@mui/material';

import DataMovementSetting from 'src/components/admin/Settings/PrefixAlerts/Dialog/GlobalSettings/DataMovementSetting';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useInitializeAlertConfig } from 'src/components/admin/Settings/PrefixAlerts/useInitializeAlertConfig';
import { defaultOutline } from 'src/context/Theme';
import { AlertConfigKeys } from 'src/utils/notification-utils';

const GlobalSettings = () => {
    const { loading } = useInitializeAlertConfig();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const duplicatePrefixExists = useAlertSubscriptionsStore(
        (state) => state.duplicatePrefixExists
    );
    const mutableConfigs = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata.configs
    );

    return (
        <Stack
            spacing={2}
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'transparent' : 'white',
                border: (theme) => defaultOutline[theme.palette.mode],
                borderRadius: '6px',
                padding: 2,
            }}
        >
            <Stack spacing="4px">
                <Typography style={{ fontSize: 16, fontWeight: 300 }}>
                    Global Settings
                </Typography>

                <Typography>
                    Default settings applied to all tasks under this prefix.
                    Individual tasks can override these values in their own
                    notification settings.
                </Typography>
            </Stack>

            <DataMovementSetting
                configs={mutableConfigs}
                disabled={duplicatePrefixExists}
                loading={loading}
                prefix={catalogPrefix}
                targetSetting={AlertConfigKeys.DATA_MOVEMENT_STALLED}
            />
        </Stack>
    );
};

export default GlobalSettings;
