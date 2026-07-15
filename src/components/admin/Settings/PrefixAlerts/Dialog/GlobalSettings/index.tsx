import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DataMovementSetting from 'src/components/admin/Settings/PrefixAlerts/Dialog/GlobalSettings/DataMovementSetting';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { useInitializeAlertConfig } from 'src/components/admin/Settings/PrefixAlerts/useInitializeAlertConfig';
import { defaultOutline } from 'src/context/Theme';
import { AlertConfigKeys } from 'src/utils/notification-utils';

const GlobalSettings = () => {
    const intl = useIntl();

    const { loading, settings } = useInitializeAlertConfig();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
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
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.label.globalSettings',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'alerts.config.dialog.message.globalSettings',
                    })}
                </Typography>
            </Stack>

            <DataMovementSetting
                settings={settings}
                loading={loading}
                prefix={catalogPrefix}
                targetSetting={AlertConfigKeys.DATA_MOVEMENT_STALLED}
            />
        </Stack>
    );
};

export default GlobalSettings;
