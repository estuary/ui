import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import DataProcessingSetting from 'components/shared/Entity/Details/Settings/DataProcessingSetting';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

function Settings() {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { getNotificationPreference } =
        useInitializeTaskNotification(catalogName);

    useEffect(() => {
        getNotificationPreference().then(
            (response) => {
                if (!response) {
                    // Failed to retrieve the live specification for this task
                }
            },
            () => {
                console.log('settings init failed');
            }
        );
    }, [getNotificationPreference]);

    return (
        <Stack sx={{ mx: 2 }}>
            <Stack sx={{ width: aboveMd ? 720 : 'unset' }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    <FormattedMessage id="details.settings.notifications.header" />
                </Typography>

                <DataProcessingSetting hideBorder />
            </Stack>
        </Stack>
    );
}

export default Settings;
