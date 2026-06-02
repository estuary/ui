import { Stack, Typography, useTheme } from '@mui/material';

import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { defaultOutline } from 'src/context/Theme';

const SummaryEmpty = () => {
    const intl = useIntl();
    const theme = useTheme();

    const catalogPrefix = useAlertSubscriptionsStore(
        (state) => state.catalogPrefix
    );

    return (
        <Stack
            style={{
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                border: defaultOutline[theme.palette.mode],
                borderRadius: '6px',
                height: 68,
                justifyContent: 'center',
                padding: 16,
            }}
        >
            <Typography>
                {intl.formatMessage(
                    {
                        id: 'alerts.config.dialog.message.noExistingSubscriptions',
                    },
                    { prefix: <b>{catalogPrefix}</b> }
                )}
            </Typography>
        </Stack>
    );
};

export default SummaryEmpty;
