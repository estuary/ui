import { useMemo } from 'react';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DataMovementSetting from 'src/components/admin/Settings/PrefixAlerts/Dialog/GlobalSettings/DataMovementSetting';
import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { defaultOutline } from 'src/context/Theme';
import { hasOwnProperty } from 'src/utils/misc-utils';

const GlobalSettings = () => {
    const intl = useIntl();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );
    const mutableSubscriptionMetadata = useAlertSubscriptionsStore(
        (state) => state.mutableSubscriptionMetadata
    );

    const targetGlobalSettings = useMemo(
        () =>
            hasOwnProperty(mutableSubscriptionMetadata, catalogPrefix)
                ? mutableSubscriptionMetadata[catalogPrefix].settings
                : {},
        [catalogPrefix, mutableSubscriptionMetadata]
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
            <Stack spacing="2px">
                <Typography style={{ fontWeight: 500 }}>
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
                prefix={catalogPrefix}
                setting={targetGlobalSettings?.['dataMovementStalled']}
            />
        </Stack>
    );
};

export default GlobalSettings;
