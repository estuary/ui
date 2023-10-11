import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import SwitchSetting from 'components/shared/Entity/Details/Settings/SwitchSetting';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useInitializeTaskNotification from 'hooks/useInitializeTaskNotification';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

function Settings() {
    const theme = useTheme();
    const aboveMd = useMediaQuery(theme.breakpoints.up('md'));

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [liveSpecId, setLiveSpecId] = useState<string | null>(null);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);

    const { getNotificationSettingsMetadata } =
        useInitializeTaskNotification(catalogName);

    useEffect(() => {
        getNotificationSettingsMetadata().then(
            (response) => {
                if (!response) {
                    // Failed to retrieve the live specification for this task
                } else {
                    setLiveSpecId(response.liveSpecId);
                    setPreferenceId(response.preferenceId);
                }
            },
            () => {
                console.log('settings init failed');
            }
        );
    }, [getNotificationSettingsMetadata, setLiveSpecId, setPreferenceId]);

    return (
        <Stack sx={{ mx: 2 }}>
            <Stack sx={{ width: aboveMd ? 720 : 'unset' }}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    <FormattedMessage id="details.settings.notifications.header" />
                </Typography>

                <SwitchSetting
                    headerId="details.settings.notifications.dataProcessing.header"
                    labelId="details.settings.notifications.dataProcessing.label.noDataProcessedInInterval"
                    liveSpecId={liveSpecId}
                    preferenceId={preferenceId}
                    messageName="data-not-processed-in-interval"
                    hideBorder
                />
            </Stack>
        </Stack>
    );
}

export default Settings;
