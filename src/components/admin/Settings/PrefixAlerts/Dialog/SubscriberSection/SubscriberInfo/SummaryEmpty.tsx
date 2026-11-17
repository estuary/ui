import { Stack, Typography, useTheme } from '@mui/material';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { defaultOutline } from 'src/context/Theme';

const SummaryEmpty = () => {
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
                No emails are configured to be notified for prefix,{' '}
                <b>{catalogPrefix}</b>.
                {
                    ' To receive notifications for this prefix, click "Add Recipient" to get started.'
                }
            </Typography>
        </Stack>
    );
};

export default SummaryEmpty;
